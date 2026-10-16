class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const fail = (status, message) => { throw new HttpError(status, message); };
const asyncHandler = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err.code === '23505') return res.status(409).json({ error: 'Ya existe un registro con ese dato único (placa, licencia, correo o ruta).' });
  if (err.code === '23503') return res.status(409).json({ error: 'No se puede eliminar o relacionar este registro: tiene referencias en otros datos.' });
  if (err.code === '23514' || err.code === '22P02' || err.code === '22003') return res.status(400).json({ error: 'Los datos violan una validación de la base de datos.' });
  console.error('[ERROR]', err);
  return res.status(500).json({ error: 'Error interno del servidor. Revisa la terminal del backend.' });
}
module.exports = { HttpError, fail, asyncHandler, errorHandler };
