const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'examen-interciclo-hospital-2026';

function firmar(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
      nombre: usuario.nombre,
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

function autenticar(req, res, next) {
  const encabezado = req.headers.authorization || '';
  const token = encabezado.startsWith('Bearer ') ? encabezado.slice(7) : '';
  if (!token) {
    return res.status(401).json({ message: 'Debe iniciar sesión' });
  }
  try {
    req.usuario = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: 'La sesión expiró o no es válida' });
  }
}

function permitir(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ message: 'Su rol no puede realizar esta acción' });
    }
    return next();
  };
}

module.exports = { firmar, autenticar, permitir };
