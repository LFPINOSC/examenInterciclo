// Panel principal: indicadores, próximas dosis y alertas de inventario
import { api } from '../api.js';
import { esc, formatoFecha } from '../utils.js';

const ALERTAS = {
  CADUCADO: ['bad', 'Caducado'],
  POR_CADUCAR: ['warn', 'Por caducar'],
  STOCK_BAJO: ['info', 'Stock bajo'],
};

export async function render(contenedor) {
  const { totales, proximas, alertasLotes, porVacuna } = await api('/reportes/resumen');
  const maximo = Math.max(1, ...porVacuna.map((v) => v.total));

  contenedor.innerHTML = `
    <div class="encabezado">
      <div><h1>Panel de vacunación</h1><p>Resumen general del centro de salud</p></div>
      <a class="btn" href="#/aplicaciones">+ Registrar vacuna</a>
    </div>

    <div class="kpis">
      <div class="tarjeta kpi"><div class="valor">${totales.pacientes}</div><div class="etiqueta">Pacientes registrados</div></div>
      <div class="tarjeta kpi"><div class="valor">${totales.aplicaciones}</div><div class="etiqueta">Dosis aplicadas (total)</div></div>
      <div class="tarjeta kpi"><div class="valor">${totales.aplicaciones_mes}</div><div class="etiqueta">Dosis este mes</div></div>
      <div class="tarjeta kpi"><div class="valor">${totales.aplicaciones_hoy}</div><div class="etiqueta">Dosis hoy</div></div>
    </div>

    <div class="grid-2">
      <div class="tarjeta">
        <h2>Próximas dosis (atrasadas y próximos 30 días)</h2>
        ${proximas.length ? `
        <div class="tabla-contenedor" style="box-shadow:none">
          <table>
            <thead><tr><th>Fecha</th><th>Paciente</th><th>Vacuna</th><th>Teléfono</th></tr></thead>
            <tbody>${proximas.map((p) => `
              <tr>
                <td>${p.atrasada ? '<span class="chip bad">Atrasada</span> ' : ''}${formatoFecha(p.proxima_dosis)}</td>
                <td>${esc(p.paciente)}<br><small>${esc(p.cedula)}</small></td>
                <td>${esc(p.vacuna)} · dosis ${p.dosis_siguiente}</td>
                <td>${esc(p.telefono || '—')}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>` : '<p class="vacio">No hay dosis pendientes en los próximos 30 días</p>'}
      </div>

      <div class="tarjeta">
        <h2>Alertas de inventario</h2>
        ${alertasLotes.length ? `
        <table>
          <thead><tr><th>Lote</th><th>Vacuna</th><th>Caduca</th><th>Stock</th></tr></thead>
          <tbody>${alertasLotes.map((l) => `
            <tr>
              <td>${esc(l.numero_lote)}<br><span class="chip ${ALERTAS[l.alerta][0]}">${ALERTAS[l.alerta][1]}</span></td>
              <td>${esc(l.vacuna)}</td>
              <td>${formatoFecha(l.fecha_caducidad)}</td>
              <td>${l.cantidad_disponible}</td>
            </tr>`).join('')}
          </tbody>
        </table>` : '<p class="vacio">Inventario sin alertas</p>'}

        <h2 style="margin-top:22px">Dosis aplicadas por vacuna</h2>
        ${porVacuna.map((v) => `
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
            <span style="width:160px;font-size:13px">${esc(v.vacuna)}</span>
            <span class="barra-progreso" style="flex:1"><span style="width:${(v.total / maximo) * 100}%"></span></span>
            <strong style="width:28px;text-align:right">${v.total}</strong>
          </div>`).join('')}
      </div>
    </div>`;
}
