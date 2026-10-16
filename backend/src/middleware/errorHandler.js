// Middleware central de errores: toda excepción termina aquí y se responde
// siempre con el mismo formato JSON { error, detalles? }.
const HttpError = require('../utils/httpError');

// Traducción de errores de MySQL a códigos HTTP comprensibles
const ERRORES_MYSQL = {
  ER_DUP_ENTRY: [409, 'Ya existe un registro con ese valor único'],
  ER_ROW_IS_REFERENCED_2: [409, 'No se puede eliminar: el registro tiene información relacionada'],
  ER_NO_REFERENCED_ROW_2: [400, 'El registro relacionado no existe'],
  ER_CHECK_CONSTRAINT_VIOLATED: [400, 'Un valor no cumple las reglas de la base de datos'],
};

function noEncontrado(req, res, next) {
  next(new HttpError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, detalles: err.detalles });
  }
  if (ERRORES_MYSQL[err.code]) {
    const [status, mensaje] = ERRORES_MYSQL[err.code];
    return res.status(status).json({ error: mensaje });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = { noEncontrado, errorHandler };
