const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const HttpError = require('../utils/httpError');
const { texto, esEmail, lanzarSiHayErrores } = require('../utils/validar');

// POST /api/auth/login  { email, password }  ->  { token, usuario }
async function login(req, res) {
  const email = texto(req.body.email).toLowerCase();
  const password = req.body.password || '';

  const errores = [];
  if (!esEmail(email)) errores.push('Ingrese un correo válido');
  if (!password) errores.push('Ingrese la contraseña');
  lanzarSiHayErrores(errores);

  const [filas] = await pool.query(
    `SELECT u.id, u.nombre, u.email, u.password_hash, u.activo, r.nombre AS rol
       FROM usuarios u JOIN roles r ON r.id = u.rol_id
      WHERE u.email = ?`,
    [email]
  );
  const usuario = filas[0];

  // Mismo mensaje si no existe o si la clave es incorrecta: no revelamos
  // a un atacante qué correos están registrados.
  if (!usuario || !(await bcrypt.compare(password, usuario.password_hash))) {
    throw new HttpError(401, 'Correo o contraseña incorrectos');
  }
  if (!usuario.activo) throw new HttpError(403, 'El usuario está desactivado');

  const datos = { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
  const token = jwt.sign(datos, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

  res.json({ token, usuario: datos });
}

// GET /api/auth/perfil  ->  datos del usuario dueño del token
function perfil(req, res) {
  res.json(req.usuario);
}

module.exports = { login, perfil };
