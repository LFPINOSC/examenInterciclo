// Funciones de validación reutilizables. El backend SIEMPRE valida, aunque
// el frontend también lo haga, porque cualquiera puede llamar a la API
// directamente (Postman, curl...) saltándose el formulario.
const HttpError = require('./httpError');

const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function esFecha(valor) {
  if (!FECHA_REGEX.test(valor || '')) return false;
  const d = new Date(valor + 'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(valor);
}

function esEmail(valor) {
  return EMAIL_REGEX.test(valor || '');
}

function esEntero(valor, min = -Infinity, max = Infinity) {
  const n = Number(valor);
  return Number.isInteger(n) && n >= min && n <= max;
}

// Algoritmo módulo 10 del Registro Civil del Ecuador
function esCedulaValida(cedula) {
  if (!/^\d{10}$/.test(cedula || '')) return false;
  const provincia = Number(cedula.slice(0, 2));
  if ((provincia < 1 || provincia > 24) && provincia !== 30) return false;
  if (Number(cedula[2]) > 5) return false;

  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let d = Number(cedula[i]) * (i % 2 === 0 ? 2 : 1);
    if (d > 9) d -= 9;
    suma += d;
  }
  const verificador = (10 - (suma % 10)) % 10;
  return verificador === Number(cedula[9]);
}

function hoy() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function sumarDias(fecha, dias) {
  const d = new Date(fecha + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

function edadEnMeses(fechaNacimiento, fechaReferencia) {
  const [a1, m1, d1] = fechaNacimiento.split('-').map(Number);
  const [a2, m2, d2] = fechaReferencia.split('-').map(Number);
  let meses = (a2 - a1) * 12 + (m2 - m1);
  if (d2 < d1) meses--;
  return meses;
}

function lanzarSiHayErrores(errores) {
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
}

function idParam(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(400, 'Id inválido');
  return id;
}

module.exports = {
  texto, esFecha, esEmail, esEntero, esCedulaValida,
  hoy, sumarDias, edadEnMeses, lanzarSiHayErrores, idParam,
};
