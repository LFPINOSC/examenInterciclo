const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { autenticar, permitir } = require('../middleware');
const { texto, correo, idParam, errorUnico } = require('../validators');

const router = express.Router();
router.use(autenticar, permitir('ADMIN'));

function mapear(fila) {
  return {
    id: fila.id_usuario,
    nombres: fila.nombres,
    apellidos: fila.apellidos,
    correo: fila.correo,
    rol: fila.rol,
    rolId: fila.id_rol,
    activo: Boolean(fila.activo),
  };
}

const consulta = `
  SELECT u.id_usuario, u.nombres, u.apellidos, u.correo, u.id_rol, u.activo, r.nombre AS rol
  FROM usuarios u
  JOIN roles r ON r.id_rol = u.id_rol
`;

function leerCuerpo(body, { passwordObligatoria }) {
  const nombres = texto(body.nombres, { min: 2, max: 80, campo: 'Nombres' });
  const apellidos = texto(body.apellidos, { min: 2, max: 80, campo: 'Apellidos' });
  const email = correo(body.correo);
  const falla = [nombres, apellidos, email].find((item) => item.error);
  if (falla) return { error: falla.error };
  const rol = db.prepare('SELECT id_rol, nombre FROM roles WHERE nombre = ?').get(String(body.rol ?? ''));
  if (!rol) return { error: 'Seleccione un rol válido' };
  const password = String(body.password ?? '');
  if (passwordObligatoria && password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' };
  }
  if (password && password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' };
  }
  return {
    valor: {
      nombres: nombres.valor,
      apellidos: apellidos.valor,
      correo: email.valor,
      rolId: rol.id_rol,
      activo: body.activo === false || body.activo === 0 ? 0 : 1,
      password,
    },
  };
}

router.get('/roles', (_req, res) => {
  const roles = db.prepare('SELECT id_rol AS id, nombre, descripcion FROM roles ORDER BY id_rol').all();
  return res.json(roles);
});

router.get('/', (_req, res) => {
  return res.json(db.prepare(`${consulta} ORDER BY u.apellidos, u.nombres`).all().map(mapear));
});

router.post('/', (req, res) => {
  const cuerpo = leerCuerpo(req.body ?? {}, { passwordObligatoria: true });
  if (cuerpo.error) return res.status(400).json({ message: cuerpo.error });
  const datos = cuerpo.valor;
  try {
    const resultado = db.prepare(
      `INSERT INTO usuarios (nombres, apellidos, correo, password_hash, id_rol, activo)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(datos.nombres, datos.apellidos, datos.correo, bcrypt.hashSync(datos.password, 10), datos.rolId, datos.activo);
    return res.status(201).json(mapear(db.prepare(`${consulta} WHERE u.id_usuario = ?`).get(Number(resultado.lastInsertRowid))));
  } catch (error) {
    const mensaje = errorUnico(error, [['usuarios.correo', 'Ya existe un usuario con ese correo']]);
    return res.status(mensaje ? 409 : 500).json({ message: mensaje || 'No se pudo crear el usuario' });
  }
});

router.put('/:id', (req, res) => {
  const id = idParam(req.params.id);
  if (!id) return res.status(400).json({ message: 'Identificador inválido' });
  const actual = db.prepare('SELECT * FROM usuarios WHERE id_usuario = ?').get(id);
  if (!actual) return res.status(404).json({ message: 'Usuario no encontrado' });
  const cuerpo = leerCuerpo(req.body ?? {}, { passwordObligatoria: false });
  if (cuerpo.error) return res.status(400).json({ message: cuerpo.error });
  const datos = cuerpo.valor;
  if (id === req.usuario.id && datos.activo === 0) {
    return res.status(409).json({ message: 'No puede desactivar su propia cuenta' });
  }
  try {
    if (datos.password) {
      db.prepare(
        `UPDATE usuarios SET nombres = ?, apellidos = ?, correo = ?, id_rol = ?, activo = ?, password_hash = ?
         WHERE id_usuario = ?`
      ).run(datos.nombres, datos.apellidos, datos.correo, datos.rolId, datos.activo, bcrypt.hashSync(datos.password, 10), id);
    } else {
      db.prepare(
        `UPDATE usuarios SET nombres = ?, apellidos = ?, correo = ?, id_rol = ?, activo = ? WHERE id_usuario = ?`
      ).run(datos.nombres, datos.apellidos, datos.correo, datos.rolId, datos.activo, id);
    }
    return res.json(mapear(db.prepare(`${consulta} WHERE u.id_usuario = ?`).get(id)));
  } catch (error) {
    const mensaje = errorUnico(error, [['usuarios.correo', 'Ya existe un usuario con ese correo']]);
    return res.status(mensaje ? 409 : 500).json({ message: mensaje || 'No se pudo actualizar el usuario' });
  }
});

router.delete('/:id', (req, res) => {
  const id = idParam(req.params.id);
  if (!id) return res.status(400).json({ message: 'Identificador inválido' });
  if (id === req.usuario.id) return res.status(409).json({ message: 'No puede eliminar su propia cuenta' });
  if (!db.prepare('SELECT id_usuario FROM usuarios WHERE id_usuario = ?').get(id)) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }
  db.prepare('UPDATE medicos SET id_usuario = NULL WHERE id_usuario = ?').run(id);
  db.prepare('DELETE FROM usuarios WHERE id_usuario = ?').run(id);
  return res.status(204).send();
});

module.exports = router;
