// Utilidades compartidas por todas las pantallas

// Escapa texto antes de insertarlo como HTML para evitar ataques XSS
// (por ejemplo, un paciente llamado "<script>...</script>").
export function esc(valor) {
  return String(valor ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function hoy() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function formatoFecha(fecha) {
  if (!fecha) return '—';
  const [a, m, d] = fecha.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}

export function edadTexto(fechaNacimiento) {
  const [a1, m1, d1] = fechaNacimiento.split('-').map(Number);
  const [a2, m2, d2] = hoy().split('-').map(Number);
  let meses = (a2 - a1) * 12 + (m2 - m1);
  if (d2 < d1) meses--;
  if (meses < 24) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  return `${Math.floor(meses / 12)} años`;
}

export function esMenorDeEdad(fechaNacimiento) {
  const limite = new Date(hoy());
  limite.setFullYear(limite.getFullYear() - 18);
  return fechaNacimiento > limite.toISOString().slice(0, 10);
}

// Misma validación módulo 10 que el backend
export function esCedulaValida(cedula) {
  if (!/^\d{10}$/.test(cedula)) return false;
  const provincia = Number(cedula.slice(0, 2));
  if ((provincia < 1 || provincia > 24) && provincia !== 30) return false;
  if (Number(cedula[2]) > 5) return false;
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let d = Number(cedula[i]) * (i % 2 === 0 ? 2 : 1);
    if (d > 9) d -= 9;
    suma += d;
  }
  return (10 - (suma % 10)) % 10 === Number(cedula[9]);
}

export const SITIOS = {
  BRAZO_IZQUIERDO: 'Brazo izquierdo',
  BRAZO_DERECHO: 'Brazo derecho',
  MUSLO_IZQUIERDO: 'Muslo izquierdo',
  MUSLO_DERECHO: 'Muslo derecho',
  ORAL: 'Oral',
  INTRADERMICA: 'Intradérmica',
};

export function opciones(lista, valorSeleccionado, { valor = 'id', texto = 'nombre', vacio } = {}) {
  const items = lista.map((item) => {
    const v = item[valor];
    const sel = String(v) === String(valorSeleccionado) ? ' selected' : '';
    return `<option value="${esc(v)}"${sel}>${esc(typeof texto === 'function' ? texto(item) : item[texto])}</option>`;
  });
  if (vacio) items.unshift(`<option value="">${esc(vacio)}</option>`);
  return items.join('');
}

export function mostrarErrores(contenedor, errores) {
  const lista = errores.filter(Boolean);
  if (!lista.length) { contenedor.innerHTML = ''; return; }
  if (lista.length === 1) { contenedor.textContent = lista[0]; return; }
  contenedor.innerHTML = `<strong>${esc(lista[0])}</strong><ul>${lista.slice(1).map((e) => `<li>${esc(e)}</li>`).join('')}</ul>`;
}

export function toast(mensaje, tipo = '') {
  const el = document.createElement('div');
  el.className = `toast ${tipo}`;
  el.textContent = mensaje;
  document.getElementById('toasts').append(el);
  setTimeout(() => el.remove(), 3500);
}

export function confirmar(mensaje) {
  return window.confirm(mensaje);
}

// Lee un formulario como objeto { nombreCampo: valor }
export function leerFormulario(form) {
  return Object.fromEntries(new FormData(form).entries());
}

/**
 * Valida un formulario combinando:
 *  1) las reglas HTML5 (required, pattern, min, max, type=email...)
 *  2) reglas personalizadas: [{ campo, valida: (valor, datos) => bool, mensaje }]
 * Marca en rojo los campos inválidos y devuelve la lista de mensajes.
 */
export function validarFormulario(form, reglas = []) {
  const datos = leerFormulario(form);
  const errores = [];
  form.querySelectorAll('input, select, textarea').forEach((el) => el.classList.remove('invalido'));

  form.querySelectorAll('input, select, textarea').forEach((el) => {
    if (!el.checkValidity()) {
      el.classList.add('invalido');
      const etiqueta = form.querySelector(`label[for="${el.id}"]`)?.textContent.replace('*', '').trim() || el.name;
      errores.push(`${etiqueta}: ${el.validationMessage}`);
    }
  });

  reglas.forEach(({ campo, valida, mensaje }) => {
    if (!valida(datos[campo] ?? '', datos)) {
      form.elements[campo]?.classList.add('invalido');
      errores.push(mensaje);
    }
  });
  return { datos, errores };
}
