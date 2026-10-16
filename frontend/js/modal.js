// Ventana modal reutilizable para todos los formularios de la app.
import { esc, mostrarErrores } from './utils.js';

/**
 * @param {object}   op
 * @param {string}   op.titulo
 * @param {string}   op.cuerpo      HTML de los campos
 * @param {Function} [op.alGuardar] async (form, cajaErrores) => false para mantener abierto
 * @param {Function} [op.alAbrir]   (form) => void, para enlazar eventos de los campos
 */
export function abrirModal({ titulo, cuerpo, alGuardar, alAbrir, textoGuardar = 'Guardar', ancho = false }) {
  const dialogo = document.getElementById('modal');
  dialogo.className = ancho ? 'ancho' : '';
  dialogo.innerHTML = `
    <form novalidate>
      <div class="modal-cabecera">
        <h2>${esc(titulo)}</h2>
        <button type="button" class="cerrar" data-cerrar aria-label="Cerrar">×</button>
      </div>
      <div class="modal-cuerpo">
        <div class="errores" role="alert"></div>
        ${cuerpo}
      </div>
      <div class="modal-pie">
        <button type="button" class="btn secundario" data-cerrar>${alGuardar ? 'Cancelar' : 'Cerrar'}</button>
        ${alGuardar ? `<button type="submit" class="btn">${esc(textoGuardar)}</button>` : ''}
      </div>
    </form>`;

  const form = dialogo.querySelector('form');
  const cajaErrores = dialogo.querySelector('.errores');
  dialogo.querySelectorAll('[data-cerrar]').forEach((b) => b.addEventListener('click', () => dialogo.close()));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!alGuardar) return;
    const boton = form.querySelector('[type="submit"]');
    boton.disabled = true;
    mostrarErrores(cajaErrores, []);
    try {
      const resultado = await alGuardar(form, cajaErrores);
      if (resultado !== false) dialogo.close();
    } catch (err) {
      // Errores devueltos por la API (400/409...) se muestran dentro del formulario
      mostrarErrores(cajaErrores, [err.message, ...err.detalles]);
    } finally {
      boton.disabled = false;
      if (cajaErrores.innerHTML) cajaErrores.scrollIntoView({ block: 'nearest' });
    }
  });

  dialogo.showModal();
  alAbrir?.(form);
  return dialogo;
}
