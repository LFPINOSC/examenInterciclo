// CRUD de pacientes + carnet de vacunación
import { api } from '../api.js';
import { abrirModal } from '../modal.js';
import {
  esc, formatoFecha, edadTexto, esMenorDeEdad, esCedulaValida, hoy,
  validarFormulario, mostrarErrores, toast, confirmar, SITIOS,
} from '../utils.js';
import { abrirFormularioAplicacion } from './aplicaciones.js';

let contexto;

export async function render(contenedor, ctx) {
  contexto = ctx;
  contenedor.innerHTML = `
    <div class="encabezado">
      <div><h1>Pacientes</h1><p>Registro de las personas que reciben vacunas</p></div>
      <button class="btn" id="btn-nuevo">+ Nuevo paciente</button>
    </div>
    <div class="barra">
      <input type="search" id="buscar" placeholder="Buscar por cédula, nombres o apellidos...">
    </div>
    <div class="tabla-contenedor">
      <table>
        <thead><tr><th>Cédula</th><th>Paciente</th><th>Edad</th><th>Sexo</th><th>Teléfono</th><th>Dosis</th><th></th></tr></thead>
        <tbody id="filas"></tbody>
      </table>
    </div>`;

  const buscar = contenedor.querySelector('#buscar');
  let espera;
  // "debounce": espera 300 ms tras dejar de escribir para no saturar la API
  buscar.addEventListener('input', () => {
    clearTimeout(espera);
    espera = setTimeout(() => cargar(buscar.value.trim()), 300);
  });
  contenedor.querySelector('#btn-nuevo').addEventListener('click', () => abrirFormulario());

  // Delegación de eventos: un solo listener para todos los botones de la tabla
  contenedor.querySelector('#filas').addEventListener('click', async (e) => {
    const boton = e.target.closest('button[data-accion]');
    if (!boton) return;
    const id = Number(boton.dataset.id);
    const recargar = () => cargar(buscar.value.trim());
    if (boton.dataset.accion === 'editar') abrirFormulario(await api(`/pacientes/${id}`));
    if (boton.dataset.accion === 'carnet') verCarnet(id);
    if (boton.dataset.accion === 'vacunar') abrirFormularioAplicacion({ pacienteId: id, alGuardar: recargar });
    if (boton.dataset.accion === 'eliminar') eliminar(id, boton.dataset.nombre);
  });

  await cargar();
}

async function cargar(q = '') {
  const tbody = document.getElementById('filas');
  const pacientes = await api(`/pacientes${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  if (!pacientes.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="vacio">${q ? 'Sin resultados para la búsqueda' : 'No hay pacientes registrados'}</td></tr>`;
    return;
  }
  tbody.innerHTML = pacientes.map((p) => `
    <tr>
      <td>${esc(p.cedula)}</td>
      <td><strong>${esc(p.apellidos)}</strong> ${esc(p.nombres)}</td>
      <td>${edadTexto(p.fecha_nacimiento)}</td>
      <td>${p.sexo === 'M' ? 'Masculino' : 'Femenino'}</td>
      <td>${esc(p.telefono || '—')}</td>
      <td><span class="chip ${p.total_dosis ? 'ok' : 'gris'}">${p.total_dosis}</span></td>
      <td class="acciones">
        <button class="btn chico" data-accion="vacunar" data-id="${p.id}">Vacunar</button>
        <button class="btn secundario chico" data-accion="carnet" data-id="${p.id}">Carnet</button>
        <button class="btn secundario chico" data-accion="editar" data-id="${p.id}">Editar</button>
        ${contexto.esAdmin ? `<button class="btn peligro chico" data-accion="eliminar" data-id="${p.id}" data-nombre="${esc(p.nombres)} ${esc(p.apellidos)}">Eliminar</button>` : ''}
      </td>
    </tr>`).join('');
}

function abrirFormulario(paciente = null) {
  const p = paciente || {};
  abrirModal({
    titulo: paciente ? 'Editar paciente' : 'Nuevo paciente',
    cuerpo: `
      <div class="fila">
        <div class="campo">
          <label for="cedula">Cédula <span class="req">*</span></label>
          <input id="cedula" name="cedula" required maxlength="10" inputmode="numeric" pattern="\\d{10}" value="${esc(p.cedula)}">
          <small id="ayuda-cedula">10 dígitos, validada con el algoritmo del Registro Civil</small>
        </div>
        <div class="campo">
          <label for="fecha_nacimiento">Fecha de nacimiento <span class="req">*</span></label>
          <input id="fecha_nacimiento" name="fecha_nacimiento" type="date" required max="${hoy()}" value="${esc(p.fecha_nacimiento)}">
        </div>
      </div>
      <div class="fila">
        <div class="campo">
          <label for="nombres">Nombres <span class="req">*</span></label>
          <input id="nombres" name="nombres" required minlength="2" maxlength="80" value="${esc(p.nombres)}">
        </div>
        <div class="campo">
          <label for="apellidos">Apellidos <span class="req">*</span></label>
          <input id="apellidos" name="apellidos" required minlength="2" maxlength="80" value="${esc(p.apellidos)}">
        </div>
      </div>
      <div class="fila">
        <div class="campo">
          <label for="sexo">Sexo <span class="req">*</span></label>
          <select id="sexo" name="sexo" required>
            <option value="">Seleccione...</option>
            <option value="M" ${p.sexo === 'M' ? 'selected' : ''}>Masculino</option>
            <option value="F" ${p.sexo === 'F' ? 'selected' : ''}>Femenino</option>
          </select>
        </div>
        <div class="campo">
          <label for="telefono">Teléfono</label>
          <input id="telefono" name="telefono" inputmode="tel" pattern="0\\d{8,9}" maxlength="10" value="${esc(p.telefono)}" placeholder="0991234567">
        </div>
      </div>
      <div class="campo">
        <label for="direccion">Dirección</label>
        <input id="direccion" name="direccion" maxlength="200" value="${esc(p.direccion)}">
      </div>
      <div class="campo">
        <label for="representante">Representante <span class="req" id="req-repr" hidden>*</span></label>
        <input id="representante" name="representante" maxlength="120" value="${esc(p.representante)}">
        <small>Obligatorio para menores de 18 años</small>
      </div>`,
    alAbrir(form) {
      // Validación en vivo de la cédula y del representante
      const ayuda = form.querySelector('#ayuda-cedula');
      form.cedula.addEventListener('input', () => {
        form.cedula.value = form.cedula.value.replace(/\D/g, '');
        const v = form.cedula.value;
        const ok = v.length < 10 || esCedulaValida(v);
        form.cedula.classList.toggle('invalido', !ok);
        ayuda.className = ok ? '' : 'error';
        ayuda.textContent = ok ? '10 dígitos, validada con el algoritmo del Registro Civil' : 'Cédula no válida';
      });
      const marcarRepresentante = () => {
        form.querySelector('#req-repr').hidden = !(form.fecha_nacimiento.value && esMenorDeEdad(form.fecha_nacimiento.value));
      };
      form.fecha_nacimiento.addEventListener('change', marcarRepresentante);
      marcarRepresentante();
      form.cedula.focus();
    },
    async alGuardar(form, cajaErrores) {
      const { datos, errores } = validarFormulario(form, [
        { campo: 'cedula', valida: esCedulaValida, mensaje: 'La cédula no es válida' },
        {
          campo: 'representante',
          valida: (v, d) => !d.fecha_nacimiento || !esMenorDeEdad(d.fecha_nacimiento) || v.trim().length > 2,
          mensaje: 'El paciente es menor de edad: ingrese el representante',
        },
      ]);
      if (errores.length) {
        mostrarErrores(cajaErrores, ['Revise los campos marcados', ...errores]);
        return false;
      }
      if (paciente) await api(`/pacientes/${paciente.id}`, { metodo: 'PUT', datos });
      else await api('/pacientes', { metodo: 'POST', datos });
      toast(paciente ? 'Paciente actualizado' : 'Paciente registrado', 'exito');
      await cargar(document.getElementById('buscar').value.trim());
    },
  });
}

async function eliminar(id, nombre) {
  if (!confirmar(`¿Eliminar al paciente ${nombre}? Esta acción no se puede deshacer.`)) return;
  try {
    await api(`/pacientes/${id}`, { metodo: 'DELETE' });
    toast('Paciente eliminado', 'exito');
    await cargar(document.getElementById('buscar').value.trim());
  } catch (err) {
    toast(err.message, 'error');
  }
}

const ESTADOS = {
  COMPLETO: ['ok', 'Completo'],
  EN_CURSO: ['warn', 'En curso'],
  PENDIENTE: ['bad', 'Pendiente'],
  NO_APLICA_AUN: ['gris', 'Aún no corresponde'],
};

export async function verCarnet(id) {
  const { paciente: p, historial, esquema } = await api(`/pacientes/${id}/carnet`);
  abrirModal({
    titulo: 'Carnet de vacunación',
    ancho: true,
    cuerpo: `
      <div class="datos-paciente">
        <div><span>Paciente</span><strong>${esc(p.apellidos)} ${esc(p.nombres)}</strong></div>
        <div><span>Cédula</span>${esc(p.cedula)}</div>
        <div><span>Nacimiento</span>${formatoFecha(p.fecha_nacimiento)} (${edadTexto(p.fecha_nacimiento)})</div>
        <div><span>Representante</span>${esc(p.representante || '—')}</div>
      </div>

      <h3 style="margin-bottom:8px">Esquema de vacunación</h3>
      <div class="tabla-contenedor" style="margin-bottom:18px">
        <table>
          <thead><tr><th>Vacuna</th><th>Progreso</th><th>Estado</th><th>Próxima dosis</th></tr></thead>
          <tbody>${esquema.map((e) => `
            <tr>
              <td>${esc(e.vacuna)}</td>
              <td><span class="barra-progreso"><span style="width:${(e.dosis_aplicadas / e.dosis_requeridas) * 100}%"></span></span>${e.dosis_aplicadas}/${e.dosis_requeridas}</td>
              <td><span class="chip ${ESTADOS[e.estado][0]}">${ESTADOS[e.estado][1]}</span></td>
              <td>${formatoFecha(e.proxima_dosis)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <h3 style="margin-bottom:8px">Historial de dosis aplicadas</h3>
      <div class="tabla-contenedor">
        <table>
          <thead><tr><th>Fecha</th><th>Vacuna</th><th>Dosis</th><th>Lote</th><th>Sitio</th><th>Aplicado por</th></tr></thead>
          <tbody>${historial.length ? historial.map((h) => `
            <tr>
              <td>${formatoFecha(h.fecha_aplicacion)}</td>
              <td>${esc(h.vacuna)}</td>
              <td>${h.numero_dosis} de ${h.dosis_requeridas}</td>
              <td>${esc(h.numero_lote)}</td>
              <td>${SITIOS[h.sitio_aplicacion]}</td>
              <td>${esc(h.aplicado_por)}</td>
            </tr>`).join('') : '<tr><td colspan="6" class="vacio">Sin vacunas registradas</td></tr>'}
          </tbody>
        </table>
      </div>`,
  });
}
