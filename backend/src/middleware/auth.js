// Seguridad: autenticación (¿quién es?) y autorización (¿qué puede hacer?)
const jwt = require('jsonwebtoken');
const HttpError = require('../utils/httpError');

// Verifica el token JWT enviado en la cabecera  Authorization: Bearer <token>
function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return next(new HttpError(401, 'Debe iniciar sesión'));
  }
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new HttpError(401, 'Sesión inválida o expirada'));
  }
}

// Permite el acceso solo a los roles indicados. Uso: autorizar('ADMIN')
function autorizar(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return next(new HttpError(403, 'No tiene permisos para realizar esta acción'));
    }
    next();
  };
}

module.exports = { autenticar, autorizar };
