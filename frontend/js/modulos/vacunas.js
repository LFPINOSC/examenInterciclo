// CRUD del catálogo de vacunas (crear/editar/eliminar solo ADMIN)
import { api } from '../api.js';
import { abrirModal } from '../modal.js';
import { esc, validarFormulario, mostrarErrores, toast, confirmar } from '../utils.js';

let contexto;

export async function render(contenedor, ctx) {
  contexto = ctx;
  contenedor.innerHTML = `
    <div class="encabezado">
      <div><h1>Vacunas</h1><p>Catálogo y esquema de cada vacuna</p></div>
      ${ctx.esAdmin ? '<button class="btn" id="btn-nuevo">+ Nueva vacuna</button>' : ''}
    </div>
    <div class="tabla-contenedor">
      <table>
        <thead><tr><th>Vacuna</th><th>Previene</th><th>Fabricante</th><th>Dosis</th><th>Intervalo</th><th>Edad mínima</th><th>Stock vigente</th><th></th></tr></thead>
        <tbody id="filas"></tbody>
      </table>
    </div>`;

  contenedor.querySelector('#btn-nuevo')?.addEventListener('click', () => abrirFormulario());
  contenedor.querySelector('#filas').addEventListener('click', async (e) => {
    const boton = e.target.closest('button[data-accion]');
    if (!boton) return;
    const id = Number(boton.dataset.id);
    if (boton.dataset.accion === 'editar') abrirFormulario(await api(`/vacunas/${id}`));
    if (boton.dataset.accion === 'eliminar') {
      if (!confirmar(`¿Eliminar la vacuna ${boton.dataset.nombre}?`)) return;
      try {
        await api(`/vacunas/${id}`, { metodo: 'DELETE' });
        toast('Vacuna eliminada', 'exito');
        cargar();
      } catch (err) {
        toast(err.message, 'error');
      }
    }
  });
  await cargar();
}

function textoEdad(meses) {
  if (meses === 0) return 'Desde el nacimiento';
  return meses < 24 ? `${meses} meses` : `${Math.floor(meses / 12)} años`;
}

async function cargar() {
  const vacunas = await api('/vacunas');
  const tbody = document.getElementById('filas');
  tbody.innerHTML = vacunas.length ? vacunas.map((v) => `
    <tr>
      <td><strong>${esc(v.nombre)}</strong></td>
      <td>${esc(v.enfermedad)}</td>
      <td>${esc(v.fabricante || '—')}</td>
      <td>${v.dosis_requeridas}</td>
      <td>${v.dosis_requeridas > 1 ? `${v.intervalo_dias} días` : '—'}</td>
      <td>${textoEdad(v.edad_minima_meses)}</td>
      <td><span class="chip ${v.stock_vigente === 0 ? 'bad' : v.stock_vigente < 10 ? 'warn' : 'ok'}">${v.stock_vigente}</span></td>
      <td class="acciones">${contexto.esAdmin ? `
        <button class="btn secundario chico" data-accion="editar" data-id="${v.id}">Editar</button>
        <button class="btn peligro chico" data-accion="eliminar" data-id="${v.id}" data-nombre="${esc(v.nombre)}">Eliminar</button>` : ''}
      </td>
    </tr>`).join('') : '<tr><td colspan="8" class="vacio">No hay vacunas registradas</td></tr>';
}

function abrirFormulario(vacuna = null) {
  const v = vacuna || { dosis_requeridas: 1, intervalo_dias: 0, edad_minima_meses: 0 };
  abrirModal({
    titulo: vacuna ? 'Editar vacuna' : 'Nueva vacuna',
    cuerpo: `
      <div class="fila">
        <div class="campo">
          <label for="nombre">Nombre <span class="req">*</span></label>
          <input id="nombre" name="nombre" required minlength="2" maxlength="80" value="${esc(v.nombre)}">
        </div>
        <div class="campo">
          <label for="fabricante">Fabricante</label>
          <input id="fabricante" name="fabricante" maxlength="80" value="${esc(v.fabricante)}">
        </div>
      </div>
      <div class="campo">
        <label for="enfermedad">Enfermedad que previene <span class="req">*</span></label>
        <input id="enfermedad" name="enfermedad" required minlength="3" maxlength="150" value="${esc(v.enfermedad)}">
      </div>
      <div class="fila">
        <div class="campo">
          <label for="dosis_requeridas">Dosis requeridas <span class="req">*</span></label>
          <input id="dosis_requeridas" name="dosis_requeridas" type="number" required min="1" max="10" value="${esc(v.dosis_requeridas)}">
        </div>
        <div class="campo">
          <label for="intervalo_dias">Intervalo entre dosis (días) <span class="req">*</span></label>
          <input id="intervalo_dias" name="intervalo_dias" type="number" required min="0" max="3650" value="${esc(v.intervalo_dias)}">
        </div>
      </div>
      <div class="campo">
        <label for="edad_minima_meses">Edad mínima (meses) <span class="req">*</span></label>
        <input id="edad_minima_meses" name="edad_minima_meses" type="number" required min="0" max="1200" value="${esc(v.edad_minima_meses)}">
        <small>0 = se puede aplicar desde el nacimiento</small>
      </div>
      <div class="campo">
        <label for="descripcion">Descripción</label>
        <textarea id="descripcion" name="descripcion" rows="2" maxlength="300">${esc(v.descripcion)}</textarea>
      </div>`,
    async alGuardar(form, cajaErrores) {
      const { datos, errores } = validarFormulario(form, [{
        campo: 'intervalo_dias',
        valida: (val, d) => Number(d.dosis_requeridas) <= 1 || Number(val) > 0,
        mensaje: 'Si la vacuna tiene varias dosis, el intervalo debe ser mayor a 0',
      }]);
      if (errores.length) {
        mostrarErrores(cajaErrores, ['Revise los campos marcados', ...errores]);
        return false;
      }
      if (vacuna) await api(`/vacunas/${vacuna.id}`, { metodo: 'PUT', datos });
      else await api('/vacunas', { metodo: 'POST', datos });
      toast(vacuna ? 'Vacuna actualizada' : 'Vacuna registrada', 'exito');
      await cargar();
    },
  });
}
