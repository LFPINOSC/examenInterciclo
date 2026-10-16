const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'cambiar-este-secreto-en-produccion';

const firmar = (u) => jwt.sign({ id: u.id, rol: u.rol, nombre: u.nombre }, SECRET, { expiresIn: '8h' });

// Verifica el token JWT del header Authorization: Bearer <token>
function requiereAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Restringe una ruta a ciertos roles
const requiereRol = (...roles) => (req, res, next) =>
  roles.includes(req.user.rol) ? next() : res.status(403).json({ error: 'No tienes permiso para esta acción' });

module.exports = { firmar, requiereAuth, requiereRol };
