const db = require('./db');

// Traduce errores de SQLite a respuestas HTTP comprensibles
function manejarError(res, e) {
  if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'Ya existe un registro con ese valor único (cédula, email, serie o código)' });
  if (e.code === 'SQLITE_CONSTRAINT_FOREIGNKEY' || /FOREIGN KEY/.test(e.message)) return res.status(409).json({ error: 'Operación inválida: referencia inexistente o registro con datos relacionados' });
  if (e.code && e.code.startsWith('SQLITE_CONSTRAINT')) return res.status(400).json({ error: 'Valor no permitido: ' + e.message });
  console.error(e);
  res.status(500).json({ error: 'Error interno del servidor' });
}

const envolver = (fn) => (req, res) => {
  try { fn(req, res); } catch (e) { manejarError(res, e); }
};

module.exports = { db, envolver };
