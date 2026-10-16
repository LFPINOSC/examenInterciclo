import { api, getToken, setToken, clearToken } from './api.js';
import { resources, labelsEstado } from './config.js';
import { $, escapeHTML, formatDate, dateForInput, displayValue, toast } from './ui.js';

const state = { user:null, page:'dashboard', records:[], editing:null, options:{} };
const landingScreen = $('#landing-screen');
const loginScreen = $('#login-screen');
const appShell = $('#app-shell');
const loading = $('#content-loading');
function busy(value) { loading.hidden = !value; }
function showLanding() {
  state.user = null;
  clearToken();
  landingScreen.hidden = false;
  loginScreen.hidden = true;
  appShell.hidden = true;
  closeSidebar();
  $('#login-password').value = '';
  window.scrollTo(0,0);
}
function showLogin() {
  state.user = null;
  clearToken();
  landingScreen.hidden = true;
  loginScreen.hidden = false;
  appShell.hidden = true;
  $('#login-password').value = '';
  window.scrollTo(0,0);
  $('#login-email').focus();
}
document.querySelectorAll('[data-open-login]').forEach(button => button.addEventListener('click', showLogin));
$('#back-to-landing').addEventListener('click', showLanding);

function showApp(user) {
  state.user = user;
  landingScreen.hidden = true;
  loginScreen.hidden = true;
  appShell.hidden = false;
  $('#user-name').textContent = user.nombre;
  $('#user-role').textContent = user.rol === 'admin' ? 'Administrador' : 'Operador';
  $('#user-avatar').textContent = user.nombre.slice(0,1).toUpperCase();
  $('#nav-usuarios').hidden = user.rol !== 'admin';
  navigate('dashboard');
}

$('#login-form').addEventListener('submit', async event => {
  event.preventDefault();
  const button = $('#login-submit');
  $('#login-error').hidden = true;
  button.disabled = true;
  button.textContent = 'Verificando…';
  try {
    const result = await api('/api/auth/login', { method:'POST', body: JSON.stringify({
      correo: $('#login-email').value.trim(), password: $('#login-password').value
    }) });
    setToken(result.token);
    showApp(result.usuario);
  } catch(error) {
    $('#login-error').textContent = error.message;
    $('#login-error').hidden = false;
  } finally {
    button.disabled = false;
    button.innerHTML = 'Ingresar al sistema <span>→</span>';
  }
});
$('#logout-btn').addEventListener('click', showLanding);
$('#sidebar-logout').addEventListener('click', showLanding);
window.addEventListener('session-expired', () => { showLogin(); toast('La sesión ha caducado. Inicia sesión nuevamente.',true); });

const allowedToEdit = page => state.user?.rol === 'admin' || page === 'viajes';
function closeSidebar() { $('#sidebar').classList.remove('sidebar-open'); $('#sidebar-scrim').hidden = true; }
$('#menu-toggle').addEventListener('click', () => {
  const open = $('#sidebar').classList.toggle('sidebar-open');
  $('#sidebar-scrim').hidden = !open;
});
$('#sidebar-scrim').addEventListener('click',closeSidebar);
$('#navigation').addEventListener('click', event => {
  const button = event.target.closest('button[data-page]');
  if (button && !button.hidden) navigate(button.dataset.page);
});
$('#go-viajes').addEventListener('click', () => navigate('viajes'));
$('#refresh-summary').addEventListener('click', loadDashboard);
$('#reload-records').addEventListener('click', loadRecords);
$('#search-input').addEventListener('input',renderTable);
$('#new-record').addEventListener('click',() => openForm(null));

function navigate(page) {
  if (page === 'usuarios' && state.user?.rol !== 'admin') return;
  state.page = page;
  closeSidebar();
  $('#dashboard-page').hidden = page !== 'dashboard';
  $('#resource-page').hidden = page === 'dashboard';
  $('#breadcrumb-page').textContent = page === 'dashboard' ? 'Dashboard' : resources[page].title;
  document.querySelectorAll('button[data-page]').forEach(button => button.classList.toggle('active',button.dataset.page === page));
  $('#search-input').value = '';
  if (page === 'dashboard') loadDashboard();
  else {
    $('#resource-title').textContent = resources[page].title;
    $('#resource-description').textContent = resources[page].description;
    $('#new-record').hidden = !allowedToEdit(page);
    loadRecords();
  }
}

async function loadDashboard() {
  busy(true);
  try {
    const data = await api('/api/resumen');
    if (state.page !== 'dashboard') return;
    const metrics = [
      {value:data.vehiculos,label:'Vehículos registrados',sym:'▣',theme:'blue'},
      {value:data.conductores,label:'Conductores',sym:'♙',theme:'purple'},
      {value:data.rutas,label:'Rutas configuradas',sym:'◇',theme:'green'},
      {value:data.viajes,label:'Viajes registrados',sym:'⇢',theme:'orange'}
    ];
    $('#stats-grid').innerHTML = metrics.map(item => `<article class="stat-card">
      <div class="stat-icon stat-${item.theme}">${item.sym}</div><div class="stat-value">${item.value}</div>
      <div class="stat-label">${item.label}</div><div class="stat-bottom">Información en tiempo real <span>↗</span></div>
      </article>`).join('');
    const next = data.proximos || [];
    $('#upcoming-trips').innerHTML = next.length ? `<table><thead><tr><th>RECORRIDO</th><th>VEHÍCULO</th><th>SALIDA</th><th>ESTADO</th></tr></thead><tbody>
      ${next.map(row => `<tr><td><strong>${escapeHTML(row.origen)} → ${escapeHTML(row.destino)}</strong><small>${escapeHTML(row.nombres)}</small></td>
      <td>${escapeHTML(row.placa)}</td><td>${escapeHTML(formatDate(row.fecha_salida))}</td><td>${displayValue('estado',row.estado)}</td></tr>`).join('')}
      </tbody></table>` : '<div class="empty">No hay viajes programados o en curso.</div>';
    const statuses = ['programado','en_curso','finalizado','cancelado'];
    const totals = Object.fromEntries((data.estados || []).map(v => [v.estado,v.total]));
    const total = Math.max(1,...statuses.map(k => totals[k] || 0));
    $('#status-bars').innerHTML = statuses.map(key => `<div class="status-group"><div class="status-header"><span>${escapeHTML(labelsEstado[key])}</span><strong>${totals[key] || 0}</strong></div><div class="status-track"><div class="status-fill fill-${key}" data-status="${key}"></div></div></div>`).join('')+
      `<div class="status-summary">${data.viajes} viajes en total registrados en el sistema.</div>`;
    $('#status-bars').querySelectorAll('[data-status]').forEach(bar => {bar.style.width = `${((totals[bar.dataset.status] || 0) / total) * 100}%`;});
  } catch (error) { toast(error.message,true); }
  finally { busy(false); }
}

async function loadRecords() {
  const page = state.page;
  if (page === 'dashboard') return;
  busy(true);
  try {
    const list = await api(`/api/${page}`);
    if(state.page !== page) return;
    state.records = list;
    renderTable();
  } catch(error) {
    $('#resource-table').innerHTML = `<div class="empty">${escapeHTML(error.message)}</div>`;
    toast(error.message,true);
  } finally { busy(false); }
}
function renderTable() {
  const config = resources[state.page];
  if (!config) return;
  const query = $('#search-input').value.trim().toLocaleLowerCase();
  const list = state.records.filter(record => Object.values(record).some(v => String(v ?? '').toLocaleLowerCase().includes(query)));
  $('#record-total').textContent = `${list.length} registro${list.length === 1 ? '' : 's'}`;
  if (!list.length) {
    $('#resource-table').innerHTML = `<div class="empty"><div class="empty-icon">⌕</div><strong>No se encontraron registros</strong><p>${query ? 'Prueba con otro término de búsqueda.' : 'Agrega un registro para comenzar.'}</p></div>`;
    return;
  }
  const actions = allowedToEdit(state.page);
  const deletable = state.user?.rol === 'admin';
  $('#resource-table').innerHTML = `<table><thead><tr>${config.columns.map(([,label]) => `<th>${escapeHTML(label.toUpperCase())}</th>`).join('')}${actions ? '<th>ACCIONES</th>' : ''}</tr></thead><tbody>
    ${list.map(record => `<tr>${config.columns.map(([key]) => `<td>${displayValue(key,record[key])}</td>`).join('')}
      ${actions ? `<td><div class="row-actions"><button class="action-edit" data-action="edit" data-id="${record[config.pk]}" title="Editar registro">Editar</button>
      ${deletable ? `<button class="action-delete" data-action="delete" data-id="${record[config.pk]}" title="Eliminar registro">Eliminar</button>` : ''}</div></td>` : ''}</tr>`).join('')}
    </tbody></table>`;
}
$('#resource-table').addEventListener('click',async event => {
  const button = event.target.closest('button[data-action]');
  if(!button) return;
  const id=Number(button.dataset.id);
  const record=state.records.find(entry=>entry[resources[state.page].pk]===id);
  if(!record) return;
  if(button.dataset.action === 'edit') await openForm(record);
  else await deleteRecord(record);
});

function relationOptions(field, record) {
  const collection = state.options[field.source] || [];
  const cfg = resources[field.source];
  const choices = collection.filter(item => item.estado === 'activo' || String(item[cfg.pk]) === String(record?.[field.name]));
  return choices.map(item => {
    const label = field.source === 'vehiculos' ? `${item.placa} · ${item.marca} ${item.modelo}`
      : field.source === 'conductores' ? `${item.nombres} · ${item.licencia}`
      : `${item.origen} → ${item.destino} (${item.distancia_km} km)`;
    return `<option value="${item[cfg.pk]}">${escapeHTML(label)}</option>`;
  }).join('');
}
function renderField(field, record) {
  const raw = record?.[field.name];
  let value = raw == null ? '' : String(raw);
  if (field.type === 'datetime-local') value = dateForInput(raw);
  if (field.type === 'password') value = '';
  if (field.name === 'activo' && !record) value = 'true';
  if (field.name === 'estado' && !record) value = field.options[0].value;
  if (field.name === 'rol' && !record) value = 'operador';
  const required = field.required || (field.name === 'password' && !record);
  const opts = field.type === 'relation' ? relationOptions(field,record) : (field.options || []).map(opt => `<option value="${escapeHTML(opt.value)}">${escapeHTML(opt.label)}</option>`).join('');
  const input = (field.type === 'select' || field.type === 'relation')
    ? `<select name="${field.name}" id="field-${field.name}" ${required ? 'required' : ''}><option value="">Seleccionar…</option>${opts}</select>`
    : field.type === 'textarea'
      ? `<textarea id="field-${field.name}" name="${field.name}" maxlength="${field.maxlength || 250}" rows="3" placeholder="Notas del viaje (opcional)">${escapeHTML(value)}</textarea>`
      : `<input id="field-${field.name}" name="${field.name}" type="${field.type}" value="${escapeHTML(value)}" ${required ? 'required' : ''}
          ${field.min != null ? `min="${field.min}"` : ''} ${field.max != null ? `max="${field.max}"` : ''}
          ${field.minlength != null ? `minlength="${field.minlength}"` : ''} ${field.maxlength != null ? `maxlength="${field.maxlength}"` : ''}
          ${field.step != null ? `step="${field.step}"` : ''} placeholder="${escapeHTML(field.placeholder || '')}" autocomplete="off">`;
  return `<div class="form-field ${field.full ? 'field-full' : ''}"><label for="field-${field.name}">${escapeHTML(field.label)} ${required ? '<span>*</span>' : ''}</label>${input}</div>`;
}
async function openForm(record) {
  if (!allowedToEdit(state.page)) return;
  const page = state.page;
  const config = resources[page];
  state.editing = record ? record[config.pk] : null;
  $('#modal-title').textContent = record ? `Editar ${config.title.slice(0,-1).toLowerCase()}` : `Nuevo registro · ${config.title}`;
  $('#form-error').hidden = true;
  $('#record-form').reset();
  if (page === 'viajes') {
    try {
      busy(true);
      const [vehiculos,conductores,rutas] = await Promise.all(['vehiculos','conductores','rutas'].map(name => api(`/api/${name}`)));
      if (state.page !== page) return;
      state.options = {vehiculos,conductores,rutas};
    } catch(error) { toast(error.message,true); return; }
    finally { busy(false); }
  }
  $('#form-fields').innerHTML = config.fields.map(field => renderField(field,record)).join('');
  config.fields.forEach(field => {
    const element = document.getElementById(`field-${field.name}`);
    if (!element) return;
    if (field.type === 'relation' && record) element.value = String(record[field.name]);
    if (field.type === 'select') {
      if (record) element.value = String(record[field.name]);
      else if(field.name === 'estado') element.value = field.options[0].value;
      else if(field.name === 'rol') element.value = 'operador';
      else if(field.name === 'activo') element.value = 'true';
    }
  });
  $('#modal-backdrop').hidden = false;
  document.body.classList.add('modal-open');
  config.fields.length && document.getElementById(`field-${config.fields[0].name}`)?.focus();
}
function closeModal() {
  $('#modal-backdrop').hidden = true;
  document.body.classList.remove('modal-open');
  state.editing = null;
}
$('#close-modal').addEventListener('click',closeModal);
$('#cancel-modal').addEventListener('click',closeModal);
$('#modal-backdrop').addEventListener('click',event=>{if(event.target.id === 'modal-backdrop')closeModal();});
document.addEventListener('keydown',event=>{ if(event.key === 'Escape' && !$('#modal-backdrop').hidden) closeModal(); });
$('#record-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form=event.currentTarget;
  if(!form.reportValidity()) return;
  const button=$('#save-record');
  const page=state.page, cfg=resources[page], editing=state.editing;
  const data={};
  const formData=new FormData(form);
  for(const field of cfg.fields) {
    const value=String(formData.get(field.name) || '').trim();
    if(field.name === 'password' && !value && editing !== null) continue;
    if(field.type === 'relation' || field.type === 'number') data[field.name] = Number(value);
    else if(field.type === 'datetime-local') data[field.name] = new Date(value).toISOString();
    else if(field.name === 'activo') data[field.name] = value === 'true';
    else data[field.name] = value;
  }
  button.disabled=true;
  button.textContent='Guardando…';
  $('#form-error').hidden=true;
  try {
    await api(`/api/${page}${editing === null ? '' : `/${editing}`}`,{method:editing === null ? 'POST' : 'PUT',body:JSON.stringify(data)});
    closeModal();
    toast(editing === null ? 'Registro creado correctamente.' : 'Cambios guardados correctamente.');
    await loadRecords();
  } catch(error) {
    $('#form-error').textContent=error.message;
    $('#form-error').hidden=false;
  } finally {button.disabled=false;button.textContent='Guardar registro';}
});
async function deleteRecord(record) {
  const page=state.page,config=resources[page],id=record[config.pk];
  if(!window.confirm(`¿Eliminar el registro #${id} de ${config.title.toLowerCase()}? Esta acción no se puede deshacer.`)) return;
  try { await api(`/api/${page}/${id}`,{method:'DELETE'}); toast('Registro eliminado.'); await loadRecords(); }
  catch(error) { toast(error.message,true); }
}

(async function initialize() {
  if (!getToken()) {showLanding();return;}
  try { showApp(await api('/api/auth/me')); }
  catch { showLanding(); }
})();
