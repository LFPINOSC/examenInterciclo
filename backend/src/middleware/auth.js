const jwt = require('jsonwebtoken');
const pool = require('../db');
const { fail, asyncHandler } = require('../errors');
const autenticar = asyncHandler(async (req, res, next) => {
  const header = req.get('Authorization') || '';
  if (!header.startsWith('Bearer ')) fail(401, 'Debes iniciar sesión.');
  let payload;
  try { payload = jwt.verify(header.slice(7), process.env.JWT_SECRET, { algorithms: ['HS256'] }); }
  catch { fail(401, 'Sesión vencida o token inválido. Ingresa nuevamente.'); }
  const { rows } = await pool.query('SELECT id_usuario, nombre, correo, rol, activo FROM usuarios WHERE id_usuario=$1', [payload.sub]);
  const user = rows[0];
  if (!user || !user.activo) fail(401, 'Usuario no autorizado o inactivo.');
  req.usuario = user;
  next();
});
const soloAdmin = (req, res, next) => req.usuario?.rol === 'admin' ? next() : next(new (require('../errors').HttpError)(403, 'Esta operación requiere el rol administrador.'));
module.exports = { autenticar, soloAdmin };
