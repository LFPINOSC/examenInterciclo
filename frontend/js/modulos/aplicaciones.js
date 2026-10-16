// Registro de vacunas aplicadas (módulo principal del sistema)
import { api } from '../api.js';
import { abrirModal } from '../modal.js';
import {
  esc, formatoFecha, hoy, opciones, validarFormulario, mostrarErrores, toast, confirmar, SITIOS,
} from '../utils.js';

let contexto;

export async function render(contenedor, ctx) {
  contexto = ctx;
  contenedor.innerHTML = `
    <div class="encabezado">
      <div><h1>Vacunación</h1><p>Dosis aplicadas a los pacientes</p></div>
      <button class="btn" id="btn-nuevo">+ Registrar vacuna</button>
    </div>
    <div class="barra">
      <label>Desde <input type="date" id="desde"></label>
      <label>Hasta <input type="date" id="hasta" max="${hoy()}"></label>
      <button class="btn secundario" id="btn-limpiar">Limpiar filtros</button>
    </div>
    <div class="tabla-contenedor">
      <table>
        <thead><tr><th>Fecha</th><th>Paciente</th><th>Vacuna</th><th>Dosis</th><th>Lote</th><th>Sitio</th><th>Próxima</th><th>Aplicado por</th><th></th></tr></thead>
        <tbody id="filas"></tbody>
      </table>
    </div>`;

  const desde = contenedor.querySelector('#desde');
  const hasta = contenedor.querySelector('#hasta');
  const filtrar = () => cargar(desde.value, hasta.value);
  desde.addEventListener('change', filtrar);
  hasta.addEventListener('change', filtrar);
  contenedor.querySelector('#btn-limpiar').addEventListener('click', () => {
    desde.value = '';
    hasta.value = '';
    filtrar();
  });
  contenedor.querySelector('#btn-nuevo').addEventListener('click', () => abrirFormularioAplicacion({ alGuardar: filtrar }));

  contenedor.querySelector('#filas').addEventListener('click', async (e) => {
    const boton = e.target.closest('button[data-accion]');
    if (!boton) return;
    const id = Number(boton.dataset.id);
    if (boton.dataset.accion === 'editar') abrirEdicion(await api(`/aplicaciones/${id}`), filtrar);
    if (boton.dataset.accion === 'eliminar') {
      if (!confirmar('¿Eliminar este registro de vacunación? La dosis se devolverá al stock del lote.')) return;
      try {
        await api(`/aplicaciones/${id}`, { metodo: 'DELETE' });
        toast('Registro eliminado', 'exito');
        filtrar();
      } catch (err) {
        toast(err.message, 'error');
      }
    }
  });

  await cargar();
}

async function cargar(desde = '', hasta = '') {
  const params = new URLSearchParams();
  if (desde) params.set('desde', desde);
  if (hasta) params.set('hasta', hasta);
  const lista = await api(`/aplicaciones?${params}`);
  const tbody = document.getElementById('filas');
  if (!lista.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="vacio">No hay vacunas registradas</td></tr>';
    return;
  }
  tbody.innerHTML = lista.map((a) => `
    <tr>
      <td>${formatoFecha(a.fecha_aplicacion)}</td>
      <td>${esc(a.paciente)}<br><small>${esc(a.cedula)}</small></td>
      <td>${esc(a.vacuna)}</td>
      <td>${a.numero_dosis} de ${a.dosis_requeridas}</td>
      <td>${esc(a.numero_lote)}</td>
      <td>${SITIOS[a.sitio_aplicacion]}</td>
      <td>${a.proxima_dosis ? formatoFecha(a.proxima_dosis) : '<span class="chip ok">Completo</span>'}</td>
      <td>${esc(a.aplicado_por)}</td>
      <td class="acciones">
        <button class="btn secundario chico" data-accion="editar" data-id="${a.id}">Editar</button>
        ${contexto.esAdmin ? `<button class="btn peligro chico" data-accion="eliminar" data-id="${a.id}">Eliminar</button>` : ''}
      </td>
    </tr>`).join('');
}

const campoSitio = (valor = '') => `
  <div class="campo">
    <label for="sitio_aplicacion">Sitio de aplicación <span class="req">*</span></label>
    <select id="sitio_aplicacion" name="sitio_aplicacion" required>
      <option value="">Seleccione...</option>
      ${Object.entries(SITIOS).map(([k, v]) => `<option value="${k}" ${k === valor ? 'selected' : ''}>${v}</option>`).join('')}
    </select>
  </div>`;

/** Formulario de nueva aplicación. Se exporta para usarlo también desde Pacientes. */
export async function abrirFormularioAplicacion({ pacienteId = '', alGuardar } = {}) {
  const [pacientes, vacunas] = await Promise.all([api('/pacientes'), api('/vacunas')]);

  abrirModal({
    titulo: 'Registrar vacuna aplicada',
    textoGuardar: 'Registrar',
    cuerpo: `
      <div class="campo">
        <label for="paciente_id">Paciente <span class="req">*</span></label>
        <select id="paciente_id" name="paciente_id" required>
          ${opciones(pacientes, pacienteId, { texto: (p) => `${p.cedula} · ${p.apellidos} ${p.nombres}`, vacio: 'Seleccione el paciente...' })}
        </select>
      </div>
      <div class="fila">
        <div class="campo">
          <label for="vacuna_id">Vacuna <span class="req">*</span></label>
          <select id="vacuna_id" name="vacuna_id" required>
            ${opciones(vacunas, '', { vacio: 'Seleccione la vacuna...' })}
          </select>
        </div>
        <div class="campo">
          <label for="lote_id">Lote <span class="req">*</span></label>
          <select id="lote_id" name="lote_id" required disabled>
            <option value="">Primero elija la vacuna</option>
          </select>
          <small id="info-lote"></small>
        </div>
      </div>
      <div class="campo"><small id="info-dosis" class="chip info" hidden></small></div>
      <div class="fila">
        <div class="campo">
          <label for="fecha_aplicacion">Fecha de aplicación <span class="req">*</span></label>
          <input id="fecha_aplicacion" name="fecha_aplicacion" type="date" required max="${hoy()}" value="${hoy()}">
        </div>
        ${campoSitio()}
      </div>
      <div class="campo">
        <label for="observaciones">Observaciones</label>
        <textarea id="observaciones" name="observaciones" rows="2" maxlength="300" placeholder="Reacciones, indicaciones..."></textarea>
      </div>`,
    alAbrir(form) {
      const infoLote = form.querySelector('#info-lote');
      const infoDosis = form.querySelector('#info-dosis');

      // Al elegir vacuna se cargan SOLO lotes vigentes y con stock desde la API
      form.vacuna_id.addEventListener('change', async () => {
        form.lote_id.disabled = true;
        infoLote.textContent = '';
        if (!form.vacuna_id.value) {
          form.lote_id.innerHTML = '<option value="">Primero elija la vacuna</option>';
        } else {
          const lotes = await api(`/lotes?vacuna_id=${form.vacuna_id.value}&vigentes=1`);
          form.lote_id.innerHTML = lotes.length
            ? opciones(lotes, lotes[0].id, { texto: (l) => `${l.numero_lote} (${l.cantidad_disponible} disp., caduca ${formatoFecha(l.fecha_caducidad)})` })
            : '<option value="">Sin lotes vigentes con stock</option>';
          form.lote_id.disabled = !lotes.length;
          if (!lotes.length) infoLote.textContent = 'Registre un lote nuevo en Lotes';
        }
        mostrarDosis();
      });
      form.paciente_id.addEventListener('change', mostrarDosis);

      // Muestra qué número de dosis se registrará (el servidor lo vuelve a calcular)
      async function mostrarDosis() {
        infoDosis.hidden = true;
        if (!form.paciente_id.value || !form.vacuna_id.value) return;
        const { esquema } = await api(`/pacientes/${form.paciente_id.value}/carnet`);
        const e = esquema.find((x) => String(x.vacuna_id) === form.vacuna_id.value);
        infoDosis.hidden = false;
        infoDosis.className = e.estado === 'COMPLETO' ? 'chip bad' : 'chip info';
        infoDosis.textContent = e.estado === 'COMPLETO'
          ? `El paciente ya completó el esquema (${e.dosis_requeridas} dosis)`
          : `Se registrará la dosis ${e.dosis_aplicadas + 1} de ${e.dosis_requeridas}`
            + (e.proxima_dosis ? ` · fecha sugerida: ${formatoFecha(e.proxima_dosis)}` : '');
      }
      if (pacienteId) form.vacuna_id.focus();
    },
    async alGuardar(form, cajaErrores) {
      const { datos, errores } = validarFormulario(form, [
        { campo: 'lote_id', valida: (v) => v !== '', mensaje: 'Seleccione un lote con stock disponible' },
      ]);
      if (errores.length) {
        mostrarErrores(cajaErrores, ['Revise los campos marcados', ...new Set(errores)]);
        return false;
      }
      delete datos.vacuna_id; // la API deduce la vacuna a partir del lote
      const r = await api('/aplicaciones', { metodo: 'POST', datos });
      toast(`Registrada dosis ${r.numero_dosis} de ${r.vacuna}`, 'exito');
      await alGuardar?.();
    },
  });
}

function abrirEdicion(a, alGuardar) {
  abrirModal({
    titulo: 'Editar registro de vacunación',
    cuerpo: `
      <div class="datos-paciente">
        <div><span>Paciente</span><strong>${esc(a.paciente)}</strong></div>
        <div><span>Vacuna</span>${esc(a.vacuna)} · dosis ${a.numero_dosis} de ${a.dosis_requeridas}</div>
        <div><span>Lote</span>${esc(a.numero_lote)}</div>
      </div>
      <small style="display:block;margin-bottom:14px;color:var(--texto-suave)">
        Paciente y lote no se modifican para conservar la trazabilidad. Si son incorrectos, elimine el registro y vuelva a crearlo.
      </small>
      <div class="fila">
        <div class="campo">
          <label for="fecha_aplicacion">Fecha de aplicación <span class="req">*</span></label>
          <input id="fecha_aplicacion" name="fecha_aplicacion" type="date" required max="${hoy()}" value="${esc(a.fecha_aplicacion)}">
        </div>
        ${campoSitio(a.sitio_aplicacion)}
      </div>
      <div class="campo">
        <label for="observaciones">Observaciones</label>
        <textarea id="observaciones" name="observaciones" rows="2" maxlength="300">${esc(a.observaciones)}</textarea>
      </div>`,
    async alGuardar(form, cajaErrores) {
      const { datos, errores } = validarFormulario(form);
      if (errores.length) {
        mostrarErrores(cajaErrores, ['Revise los campos marcados', ...errores]);
        return false;
      }
      await api(`/aplicaciones/${a.id}`, { metodo: 'PUT', datos });
      toast('Registro actualizado', 'exito');
      await alGuardar();
    },
  });
}
