// Error con código HTTP. Los controladores lo lanzan y el middleware
// errorHandler lo convierte en una respuesta JSON uniforme.
class HttpError extends Error {
  constructor(status, mensaje, detalles) {
    super(mensaje);
    this.status = status;
    this.detalles = detalles;
  }
}

module.exports = HttpError;
