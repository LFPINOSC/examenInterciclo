const express = require('express');
const { db } = require('../db');
const { autenticar, permitir } = require('../middleware');
const { texto, cedula, correo, telefono, idParam, errorUnico, enteroPositivo } = require('../validators');

const router = express.Router();
router.use(autenticar);

function mapear(fila) {
  return {
    id: fila.id_medico,
    cedula: fila.cedula,
    nombres: fila.nombres,
    apellidos: fila.apellidos,
    especialidad: fila.especialidad,
    telefono: fila.telefono,
    correo: fila.correo,
    usuarioId: fila.id_usuario,
    usuarioNombre: fila.usuario_nombre || null,
  };
}

const consulta = `
  SELECT m.*, CASE WHEN u.id_usuario IS NULL THEN NULL ELSE u.nombres || ' ' || u.apellidos END AS usuario_nombre
  FROM medicos m
  LEFT JOIN usuarios u ON u.id_usuario = m.id_usuario
`;

function leerCuerpo(body, idActual) {
  const campos = {
    cedula: cedula(body.cedula, 'Cédula del médico'),
    nombres: texto(body.nombres, { min: 2, max: 80, campo: 'Nombres' }),
    apellidos: texto(body.apellidos, { min: 2, max: 80, campo: 'Apellidos' }),
    especialidad: texto(body.especialidad, { min: 3, max: 80, campo: 'Especialidad' }),
    telefono: telefono(body.telefono),
    correo: correo(body.correo),
  };
  for (const campo of Object.values(campos)) {
    if (campo.error) return { error: campo.error };
  }
  let usuarioId = null;
  if (body.usuarioId !== null && body.usuarioId !== undefined && body.usuarioId !== '') {
    const usuario = enteroPositivo(body.usuarioId, 'Usuario');
    if (usuario.error) return { error: usuario.error };
    const cuenta = db.prepare(
      `SELECT u.id_usuario, r.nombre AS rol
       FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol
       WHERE u.id_usuario = ?`
    ).get(usuario.valor);
    if (!cuenta || cuenta.rol !== 'MEDICO') {
      return { error: 'La cuenta vinculada debe ser un usuario con rol médico' };
    }
    const ocupada = db.prepare('SELECT id_medico FROM medicos WHERE id_usuario = ? AND id_medico != ?').get(usuario.valor, idActual ?? 0);
    if (ocupada) return { error: 'Esa cuenta ya está vinculada a otro médico' };
    usuarioId = usuario.valor;
  }
  return { valor: { ...Object.fromEntries(Object.entries(campos).map(([k, v]) => [k, v.valor])), usuarioId } };
}

router.get('/', (req, res) => {
  const q = String(req.query.q ?? '').trim().replace(/[%_]/g, '');
  const params = [];
  let filtro = '';
  if (q) {
    filtro = `WHERE m.cedula LIKE ? OR m.nombres LIKE ? OR m.apellidos LIKE ? OR m.especialidad LIKE ? OR (m.nombres || ' ' || m.apellidos) LIKE ?`;
    const like = `%${q}%`;
    params.push(like, like, like, like, like);
  }
  return res.json(db.prepare(`${consulta} ${filtro} ORDER BY m.apellidos, m.nombres`).all(...params).map(mapear));
});

router.get('/:id', (req, res) => {
  const id = idParam(req.params.id);
  if (!id) return res.status(400).json({ message: 'Identificador inválido' });
  const fila = db.prepare(`${consulta} WHERE m.id_medico = ?`).get(id);
  if (!fila) return res.status(404).json({ message: 'Médico no encontrado' });
  return res.json(mapear(fila));
});

router.post('/', permitir('ADMIN'), (req, res) => {
  const cuerpo = leerCuerpo(req.body ?? {});
  if (cuerpo.error) return res.status(400).json({ message: cuerpo.error });
  const datos = cuerpo.valor;
  try {
    const resultado = db.prepare(
      `INSERT INTO medicos (cedula, nombres, apellidos, especialidad, telefono, correo, id_usuario)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(datos.cedula, datos.nombres, datos.apellidos, datos.especialidad, datos.telefono, datos.correo, datos.usuarioId);
    const fila = db.prepare(`${consulta} WHERE m.id_medico = ?`).get(Number(resultado.lastInsertRowid));
    return res.status(201).json(mapear(fila));
  } catch (error) {
    const mensaje = errorUnico(error, [
      ['medicos.cedula', 'Ya existe un médico con esa cédula'],
      ['medicos.correo', 'Ya existe un médico con ese correo'],
      ['medicos.id_usuario', 'Esa cuenta ya está vinculada a otro médico'],
    ]);
    return res.status(mensaje ? 409 : 500).json({ message: mensaje || 'No se pudo registrar el médico' });
  }
});

router.put('/:id', permitir('ADMIN'), (req, res) => {
  const id = idParam(req.params.id);
  if (!id) return res.status(400).json({ message: 'Identificador inválido' });
  if (!db.prepare('SELECT id_medico FROM medicos WHERE id_medico = ?').get(id)) {
    return res.status(404).json({ message: 'Médico no encontrado' });
  }
  const cuerpo = leerCuerpo(req.body ?? {}, id);
  if (cuerpo.error) return res.status(400).json({ message: cuerpo.error });
  const datos = cuerpo.valor;
  try {
    db.prepare(
      `UPDATE medicos SET cedula = ?, nombres = ?, apellidos = ?, especialidad = ?, telefono = ?, correo = ?, id_usuario = ?
       WHERE id_medico = ?`
    ).run(datos.cedula, datos.nombres, datos.apellidos, datos.especialidad, datos.telefono, datos.correo, datos.usuarioId, id);
    return res.json(mapear(db.prepare(`${consulta} WHERE m.id_medico = ?`).get(id)));
  } catch (error) {
    const mensaje = errorUnico(error, [
      ['medicos.cedula', 'Ya existe un médico con esa cédula'],
      ['medicos.correo', 'Ya existe un médico con ese correo'],
      ['medicos.id_usuario', 'Esa cuenta ya está vinculada a otro médico'],
    ]);
    return res.status(mensaje ? 409 : 500).json({ message: mensaje || 'No se pudo actualizar el médico' });
  }
});

router.delete('/:id', permitir('ADMIN'), (req, res) => {
  const id = idParam(req.params.id);
  if (!id) return res.status(400).json({ message: 'Identificador inválido' });
  if (!db.prepare('SELECT id_medico FROM medicos WHERE id_medico = ?').get(id)) {
    return res.status(404).json({ message: 'Médico no encontrado' });
  }
  const historial = db.prepare('SELECT COUNT(*) AS total FROM hospitalizaciones WHERE id_medico = ?').get(id);
  if (historial.total > 0) {
    return res.status(409).json({ message: 'No se puede eliminar: el médico tiene hospitalizaciones a su cargo' });
  }
  db.prepare('DELETE FROM medicos WHERE id_medico = ?').run(id);
  return res.status(204).send();
});

module.exports = router;
