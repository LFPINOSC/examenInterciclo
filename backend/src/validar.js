// Validaciones simples reutilizables. Devuelven un mensaje de error o null.
const vacio = (v) => v === undefined || v === null || String(v).trim() === '';
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function requeridos(body, campos) {
  const falta = campos.filter((c) => vacio(body[c]));
  return falta.length ? `Campos obligatorios: ${falta.join(', ')}` : null;
}

// Cédula ecuatoriana: 10 dígitos, provincia 01-24, algoritmo módulo 10
function cedulaOk(c) {
  if (!/^\d{10}$/.test(c)) return false;
  const prov = +c.slice(0, 2);
  if (prov < 1 || prov > 24 || +c[2] > 5) return false;
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let n = +c[i] * (i % 2 === 0 ? 2 : 1);
    if (n > 9) n -= 9;
    suma += n;
  }
  return (10 - (suma % 10)) % 10 === +c[9];
}

module.exports = { vacio, emailOk, requeridos, cedulaOk };
