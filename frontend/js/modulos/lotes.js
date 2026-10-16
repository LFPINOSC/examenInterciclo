// CRUD de lotes (inventario de vacunas). Crear/editar/eliminar solo ADMIN.
import { api } from '../api.js';
import { abrirModal } from '../modal.js';
import { esc, formatoFecha, hoy, opciones, validarFormulario, mostrarErrores, toast, confirmar } from '../utils.js';

let contexto;
let vacunas = [];

export async function render(contenedor, ctx) {
  contexto = ctx;
  vacunas = await api('/vacunas');
  contenedor.innerHTML = `
    <div class="encabezado">
      <div><h1>Lotes</h1><p>Inventario, stock y caducidad de las vacunas</p></div>
      ${ctx.esAdmin ? '<button class="btn" id="btn-nuevo">+ Nuevo lote</button>' : ''}
    </div>
    <div class="barra">
      <select id="filtro-vacuna">${opciones(vacunas, '', { vacio: 'Todas las vacunas' })}</select>
    </div>
    <div class="tabla-contenedor">
      <table>
        <thead><tr><th>Lote</th><th>Vacuna</th><th>Ingreso</th><th>Caducidad</th><th>Disponible</th><th>Usadas</th><th>Estado</th><th></th></tr></thead>
        <tbody id="filas"></tbody>
      </table>
    </div>`;

  const filtro = contenedor.querySelector('#filtro-vacuna');
  filtro.addEventListener('change', () => cargar());
  contenedor.querySelector('#btn-nuevo')?.addEventListener('click', () => abrirFormulario());
  contenedor.querySelector('#filas').addEventListener('click', async (e) => {
    const boton = e.target.closest('button[data-accion]');
    if (!boton) return;
    const id = Number(boton.dataset.id);
    if (boton.dataset.accion === 'editar') abrirFormulario(await api(`/lotes/${id}`));
    if (boton.dataset.accion === 'eliminar') {
      if (!confirmar(`¿Eliminar el lote ${boton.dataset.nombre}?`)) return;
      try {
        await api(`/lotes/${id}`, { metodo: 'DELETE' });
        toast('Lote eliminado', 'exito');
        cargar();
      } catch (err) {
        toast(err.message, 'error');
      }
    }
  });
  await cargar();
}

function estado(l) {
  if (l.caducado) return '<span class="chip bad">Caducado</span>';
  if (l.cantidad_disponible === 0) return '<span class="chip gris">Agotado</span>';
  const dias = (new Date(l.fecha_caducidad) - new Date(hoy())) / 86400000;
  if (dias <= 30) return '<span class="chip warn">Por caducar</span>';
  if (l.cantidad_disponible < 10) return '<span class="chip info">Stock bajo</span>';
  return '<span class="chip ok">Vigente</span>';
}

async function cargar() {
  const vacunaId = document.getElementById('filtro-vacuna').value;
  const lotes = await api(`/lotes${vacunaId ? `?vacuna_id=${vacunaId}` : ''}`);
  document.getElementById('filas').innerHTML = lotes.length ? lotes.map((l) => `
    <tr>
      <td><strong>${esc(l.numero_lote)}</strong></td>
      <td>${esc(l.vacuna)}</td>
      <td>${formatoFecha(l.fecha_ingreso)}</td>
      <td>${formatoFecha(l.fecha_caducidad)}</td>
      <td>${l.cantidad_disponible}</td>
      <td>${l.dosis_usadas}</td>
      <td>${estado(l)}</td>
      <td class="acciones">${contexto.esAdmin ? `
        <button class="btn secundario chico" data-accion="editar" data-id="${l.id}">Editar</button>
        <button class="btn peligro chico" data-accion="eliminar" data-id="${l.id}" data-nombre="${esc(l.numero_lote)}">Eliminar</button>` : ''}
      </td>
    </tr>`).join('') : '<tr><td colspan="8" class="vacio">No hay lotes registrados</td></tr>';
}

function abrirFormulario(lote = null) {
  const l = lote || { fecha_ingreso: hoy(), cantidad_disponible: '' };
  abrirModal({
    titulo: lote ? `Editar lote ${lote.numero_lote}` : 'Nuevo lote',
    cuerpo: `
      <div class="campo">
        <label for="vacuna_id">Vacuna <span class="req">*</span></label>
        <select id="vacuna_id" name="vacuna_id" required ${lote?.dosis_usadas ? 'disabled' : ''}>
          ${opciones(vacunas, l.vacuna_id, { vacio: 'Seleccione...' })}
        </select>
        ${lote?.dosis_usadas ? `<input type="hidden" name="vacuna_id" value="${l.vacuna_id}"><small>No se puede cambiar: el lote ya fue usado</small>` : ''}
      </div>
      <div class="fila">
        <div class="campo">
          <label for="numero_lote">Número de lote <span class="req">*</span></label>
          <input id="numero_lote" name="numero_lote" required minlength="3" maxlength="40" pattern="[A-Za-z0-9\\-]+" value="${esc(l.numero_lote)}" placeholder="PEN-2026-001">
        </div>
        <div class="campo">
          <label for="cantidad_disponible">Cantidad disponible <span class="req">*</span></label>
          <input id="cantidad_disponible" name="cantidad_disponible" type="number" required min="0" max="100000" value="${esc(l.cantidad_disponible)}">
        </div>
      </div>
      <div class="fila">
        <div class="campo">
          <label for="fecha_ingreso">Fecha de ingreso <span class="req">*</span></label>
          <input id="fecha_ingreso" name="fecha_ingreso" type="date" required max="${hoy()}" value="${esc(l.fecha_ingreso)}">
        </div>
        <div class="campo">
          <label for="fecha_caducidad">Fecha de caducidad <span class="req">*</span></label>
          <input id="fecha_caducidad" name="fecha_caducidad" type="date" required value="${esc(l.fecha_caducidad)}">
        </div>
      </div>`,
    async alGuardar(form, cajaErrores) {
      const { datos, errores } = validarFormulario(form, [{
        campo: 'fecha_caducidad',
        valida: (v, d) => !v || !d.fecha_ingreso || v > d.fecha_ingreso,
        mensaje: 'La caducidad debe ser posterior a la fecha de ingreso',
      }]);
      if (errores.length) {
        mostrarErrores(cajaErrores, ['Revise los campos marcados', ...errores]);
        return false;
      }
      if (lote) await api(`/lotes/${lote.id}`, { metodo: 'PUT', datos });
      else await api('/lotes', { metodo: 'POST', datos });
      toast(lote ? 'Lote actualizado' : 'Lote registrado', 'exito');
      await cargar();
    },
  });
}
