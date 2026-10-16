const TIPOS_SANGRE = ['', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const SEXOS = ['M', 'F', 'O'];
const TIPOS_HABITACION = ['GENERAL', 'UCI', 'PEDIATRIA', 'AISLAMIENTO'];
const ESTADOS_HABITACION = ['DISPONIBLE', 'OCUPADA', 'MANTENIMIENTO'];
const MOTIVOS_ALTA = ['MEJORIA', 'TRASLADO', 'ALTA_VOLUNTARIA', 'FALLECIMIENTO'];

function texto(valor, { min = 1, max = 180, campo = 'Campo' } = {}) {
  const limpio = String(valor ?? '').trim();
  if (limpio.length < min || limpio.length > max) {
    return { error: `${campo} debe tener entre ${min} y ${max} caracteres` };
  }
  return { valor: limpio };
}

function cedulaValida(cedula) {
  if (!/^\d{10}$/.test(cedula)) return false;
  const provincia = Number(cedula.slice(0, 2));
  if (provincia < 1 || provincia > 24) return false;
  if (Number(cedula[2]) >= 6) return false;
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  for (let i = 0; i < 9; i += 1) {
    let parcial = Number(cedula[i]) * coeficientes[i];
    if (parcial >= 10) parcial -= 9;
    suma += parcial;
  }
  const digito = (10 - (suma % 10)) % 10;
  return digito === Number(cedula[9]);
}

function cedula(valor, campo = 'Cédula') {
  const limpio = String(valor ?? '').trim();
  if (!cedulaValida(limpio)) {
    return { error: `${campo} no es una cédula ecuatoriana válida` };
  }
  return { valor: limpio };
}

function correo(valor) {
  const limpio = String(valor ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio) || limpio.length > 120) {
    return { error: 'Correo electrónico inválido' };
  }
  return { valor: limpio };
}

function telefono(valor, campo = 'Teléfono') {
  const limpio = String(valor ?? '').replace(/\D/g, '');
  if (limpio.length < 7 || limpio.length > 10) {
    return { error: `${campo} debe tener entre 7 y 10 dígitos` };
  }
  return { valor: limpio };
}

function fecha(valor, campo = 'Fecha') {
  const limpio = String(valor ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(limpio)) {
    return { error: `${campo} debe tener formato AAAA-MM-DD` };
  }
  const fechaReal = new Date(`${limpio}T00:00:00`);
  if (Number.isNaN(fechaReal.getTime())) {
    return { error: `${campo} no es una fecha real` };
  }
  return { valor: limpio };
}

function opcional(valor, max = 500) {
  const limpio = String(valor ?? '').trim();
  if (limpio.length > max) return { error: `El texto no puede superar ${max} caracteres` };
  return { valor: limpio };
}

function enteroPositivo(valor, campo) {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    return { error: `${campo} es obligatorio` };
  }
  return { valor: numero };
}

function idParam(valor) {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) return null;
  return numero;
}

function errorUnico(error, mensajes) {
  const textoError = String(error.message || '');
  if (textoError.includes('UNIQUE')) {
    const encontrado = mensajes.find(([fragmento]) => textoError.includes(fragmento));
    return encontrado ? encontrado[1] : 'Ya existe un registro con ese dato único';
  }
  if (textoError.includes('FOREIGN KEY')) {
    return 'No se puede completar porque el registro está relacionado con otros datos';
  }
  return null;
}

module.exports = {
  TIPOS_SANGRE,
  SEXOS,
  TIPOS_HABITACION,
  ESTADOS_HABITACION,
  MOTIVOS_ALTA,
  texto,
  cedula,
  correo,
  telefono,
  fecha,
  opcional,
  enteroPositivo,
  idParam,
  errorUnico,
};
