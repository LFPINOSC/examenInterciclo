const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const HttpError = require('../utils/httpError');
const { texto, esEmail, esEntero, lanzarSiHayErrores, idParam } = require('../utils/validar');

// Nunca se devuelve password_hash al cliente
const SELECT_USUARIOS = `
  SELECT u.id, u.nombre, u.email, u.rol_id, r.nombre AS rol, u.activo, u.creado_en
    FROM usuarios u JOIN roles r ON r.id = u.rol_id`;

function validar(body, esNuevo) {
  const datos = {
    nombre: texto(body.nombre),
    email: texto(body.email).toLowerCase(),
    rol_id: Number(body.rol_id),
    activo: body.activo === undefined ? 1 : (body.activo ? 1 : 0),
    password: body.password || '',
  };
  const errores = [];
  if (datos.nombre.length < 3) errores.push('El nombre debe tener al menos 3 caracteres');
  if (!esEmail(datos.email)) errores.push('El correo no es válido');
  if (!esEntero(datos.rol_id, 1)) errores.push('Seleccione el rol');
  // En edición la contraseña es opcional (vacía = no cambiarla)
  if (esNuevo || datos.password) {
    if (datos.password.length < 8 || !/\d/.test(datos.password) || !/[A-Za-z]/.test(datos.password)) {
      errores.push('La contraseña debe tener mínimo 8 caracteres, con letras y números');
    }
  }
  lanzarSiHayErrores(errores);
  return datos;
}

async function buscarRol(rolId) {
  const [filas] = await pool.query('SELECT id, nombre FROM roles WHERE id = ?', [rolId]);
  if (!filas[0]) throw new HttpError(400, 'El rol seleccionado no existe');
  return filas[0];
}

async function buscarPorId(id) {
  const [filas] = await pool.query(`${SELECT_USUARIOS} WHERE u.id = ?`, [id]);
  if (!filas[0]) throw new HttpError(404, 'Usuario no encontrado');
  return filas[0];
}

async function listar(req, res) {
  const [filas] = await pool.query(`${SELECT_USUARIOS} ORDER BY u.nombre`);
  res.json(filas);
}

async function obtener(req, res) {
  res.json(await buscarPorId(idParam(req)));
}

async function crear(req, res) {
  const d = validar(req.body, true);
  await buscarRol(d.rol_id);
  const hash = await bcrypt.hash(d.password, 10);
  const [r] = await pool.query(
    'INSERT INTO usuarios (rol_id, nombre, email, password_hash, activo) VALUES (?, ?, ?, ?, ?)',
    [d.rol_id, d.nombre, d.email, hash, d.activo]
  );
  res.status(201).json(await buscarPorId(r.insertId));
}

async function actualizar(req, res) {
  const id = idParam(req);
  await buscarPorId(id);
  const d = validar(req.body, false);
  const rol = await buscarRol(d.rol_id);

  if (id === req.usuario.id && (rol.nombre !== 'ADMIN' || !d.activo)) {
    throw new HttpError(400, 'No puede quitarse el rol de administrador ni desactivarse a sí mismo');
  }

  await pool.query(
    'UPDATE usuarios SET rol_id = ?, nombre = ?, email = ?, activo = ? WHERE id = ?',
    [d.rol_id, d.nombre, d.email, d.activo, id]
  );
  if (d.password) {
    const hash = await bcrypt.hash(d.password, 10);
    await pool.query('UPDATE usuarios SET password_hash = ? WHERE id = ?', [hash, id]);
  }
  res.json(await buscarPorId(id));
}

async function eliminar(req, res) {
  const id = idParam(req);
  if (id === req.usuario.id) throw new HttpError(400, 'No puede eliminar su propio usuario');
  await buscarPorId(id);
  try {
    await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new HttpError(409, 'El usuario tiene vacunas registradas; desactívelo en lugar de eliminarlo');
    }
    throw err;
  }
  res.status(204).end();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
