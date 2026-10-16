const API = '/api';
const $ = (s) => document.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ESTADOS = { pendiente: 'Pendiente', en_proceso: 'En proceso', completada: 'Completada', cancelada: 'Cancelada' };
const PRIORIDADES = { baja: 'Baja', media: 'Media', alta: 'Alta' };

let sesion = JSON.parse(localStorage.getItem('sesion') || 'null');
const esAdmin = () => sesion?.usuario.rol === 'admin';

/* ---------- Cliente HTTP ---------- */
async function api(ruta, method = 'GET', body) {
  const res = await fetch(API + ruta, {
    method,
    headers: { 'Content-Type': 'application/json', ...(sesion ? { Authorization: 'Bearer ' + sesion.token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && sesion) { cerrarSesion(); throw new Error('Sesión expirada'); }
  if (!res.ok) throw new Error(data.error || 'Error ' + res.status);
  return data;
}

function toast(msg, err = false) {
  const t = $('#toast'); t.textContent = msg; t.className = 'show' + (err ? ' err' : '');
  clearTimeout(toast.t); toast.t = setTimeout(() => (t.className = ''), 3000);
}
const intentar = (fn) => async (...a) => { try { await fn(...a); } catch (e) { toast(e.message, true); } };

/* ---------- Modal de formularios ---------- */
// campos: [{name,label,type,required,options:[[valor,texto]],value,pattern,min}]
function formulario(titulo, campos, onSubmit) {
  $('#modal-title').textContent = titulo;
  $('#modal-error').textContent = '';
  $('#modal-fields').innerHTML = campos.map((c) => {
    const base = `name="${c.name}" ${c.required ? 'required' : ''}`;
    let input;
    if (c.type === 'select')
      input = `<select ${base}>${c.options.map(([v, t]) => `<option value="${esc(v)}" ${String(v) === String(c.value ?? '') ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
    else if (c.type === 'textarea') input = `<textarea ${base} rows="3">${esc(c.value)}</textarea>`;
    else input = `<input ${base} type="${c.type || 'text'}" value="${esc(c.value)}" ${c.min !== undefined ? `min="${c.min}" step="any"` : ''} ${c.pattern ? `pattern="${c.pattern}"` : ''} ${c.maxlength ? `maxlength="${c.maxlength}"` : ''}>`;
    return `<label>${esc(c.label)}${c.required ? ' *' : ''}${input}</label>`;
  }).join('');
  const form = $('#modal-form');
  form.onsubmit = async (ev) => {
    ev.preventDefault();
    const inputs = [...form.querySelectorAll('input,select,textarea')];
    inputs.forEach((i) => i.classList.remove('invalid'));
    const malo = inputs.find((i) => !i.checkValidity());
    if (malo) { malo.classList.add('invalid'); $('#modal-error').textContent = `Revisa el campo: ${malo.closest('label').firstChild.textContent.trim()}`; malo.focus(); return; }
    const datos = Object.fromEntries(inputs.map((i) => [i.name, i.value.trim()]));
    try { await onSubmit(datos); $('#modal').close(); }
    catch (e) { $('#modal-error').textContent = e.message; }
  };
  $('#modal').showModal();
}
$('#modal-cancel').onclick = () => $('#modal').close();

const confirmar = (msg) => window.confirm(msg);

/* ---------- Sesión ---------- */
$('#login-form').onsubmit = async (ev) => {
  ev.preventDefault();
  const f = ev.target; $('#login-error').textContent = '';
  if (!f.email.checkValidity() || !f.password.value) { $('#login-error').textContent = 'Ingresa un email válido y la contraseña'; return; }
  try {
    sesion = await api('/auth/login', 'POST', { email: f.email.value, password: f.password.value });
    localStorage.setItem('sesion', JSON.stringify(sesion));
    iniciarApp();
  } catch (e) { $('#login-error').textContent = e.message; }
};
$('#logout').onclick = () => cerrarSesion();
function cerrarSesion() {
  sesion = null; localStorage.removeItem('sesion');
  $('#app-view').hidden = true; $('#login-view').hidden = false;
}

const VISTAS = {
  inicio: { texto: 'Inicio', render: vistaInicio },
  ordenes: { texto: 'Órdenes', render: vistaOrdenes },
  clientes: { texto: 'Clientes', render: vistaClientes, admin: true },
  equipos: { texto: 'Equipos', render: vistaEquipos, admin: true },
  usuarios: { texto: 'Usuarios', render: vistaUsuarios, admin: true },
};
let vistaActual = 'inicio';
function iniciarApp() {
  $('#login-view').hidden = true; $('#app-view').hidden = false;
  $('#user-info').textContent = `${sesion.usuario.nombre} (${sesion.usuario.rol})`;
  $('#nav').innerHTML = Object.entries(VISTAS).filter(([, v]) => !v.admin || esAdmin())
    .map(([k, v]) => `<button data-v="${k}">${v.texto}</button>`).join('');
  $('#nav').onclick = (e) => e.target.dataset.v && ir(e.target.dataset.v);
  ir('inicio');
}
function ir(v) {
  vistaActual = v;
  document.querySelectorAll('#nav button').forEach((b) => b.classList.toggle('active', b.dataset.v === v));
  intentar(VISTAS[v].render)();
}
const refrescar = () => ir(vistaActual);

/* ---------- Inicio ---------- */
async function vistaInicio() {
  const { por_estado } = await api('/resumen');
  const n = (e) => por_estado.find((x) => x.estado === e)?.total || 0;
  $('#main').innerHTML = `<h2>Resumen</h2><div class="stats">
    ${Object.entries(ESTADOS).map(([k, t]) => `<div class="card stat"><b>${n(k)}</b>${t}</div>`).join('')}</div>
    <p>${esAdmin() ? 'Administra clientes, equipos, órdenes y usuarios desde el menú.' : 'Aquí ves únicamente las órdenes asignadas a ti.'}</p>`;
}

/* ---------- Clientes ---------- */
async function vistaClientes() {
  const q = $('#q-cli')?.value || '';
  const lista = await api('/clientes?q=' + encodeURIComponent(q));
  $('#main').innerHTML = `<div class="toolbar"><h2 class="grow">Clientes</h2>
    <input id="q-cli" placeholder="Buscar por nombre o cédula" value="${esc(q)}"><button id="nuevo">+ Nuevo cliente</button></div>
    ${tabla(['Nombre', 'Cédula', 'Teléfono', 'Email', ''], lista.map((c) => [esc(c.nombre), esc(c.cedula), esc(c.telefono), esc(c.email),
      `<td class="actions"><button class="small" data-e="${c.id}">Editar</button><button class="small danger" data-d="${c.id}">Eliminar</button></td>`]))}`;
  $('#q-cli').onchange = refrescar;
  $('#nuevo').onclick = () => formCliente();
  $('#main').onclick = intentar(async (e) => {
    if (e.target.dataset.e) formCliente(lista.find((c) => c.id == e.target.dataset.e));
    if (e.target.dataset.d && confirmar('¿Eliminar este cliente?')) { await api('/clientes/' + e.target.dataset.d, 'DELETE'); toast('Cliente eliminado'); refrescar(); }
  });
}
function formCliente(c = {}) {
  formulario(c.id ? 'Editar cliente' : 'Nuevo cliente', [
    { name: 'nombre', label: 'Nombre', required: true, value: c.nombre },
    { name: 'cedula', label: 'Cédula', required: true, value: c.cedula, pattern: '\\d{10}', maxlength: 10 },
    { name: 'telefono', label: 'Teléfono', value: c.telefono, pattern: '\\d{7,10}' },
    { name: 'email', label: 'Email', type: 'email', value: c.email },
    { name: 'direccion', label: 'Dirección', value: c.direccion },
  ], async (d) => { await api(c.id ? '/clientes/' + c.id : '/clientes', c.id ? 'PUT' : 'POST', d); toast('Cliente guardado'); refrescar(); });
}

/* ---------- Equipos ---------- */
async function vistaEquipos() {
  const lista = await api('/equipos');
  $('#main').innerHTML = `<div class="toolbar"><h2 class="grow">Equipos</h2><button id="nuevo">+ Nuevo equipo</button></div>
    ${tabla(['Cliente', 'Tipo', 'Marca', 'Modelo', 'Serie', ''], lista.map((e) => [esc(e.cliente), esc(e.tipo), esc(e.marca), esc(e.modelo), esc(e.serie),
      `<td class="actions"><button class="small" data-e="${e.id}">Editar</button><button class="small danger" data-d="${e.id}">Eliminar</button></td>`]))}`;
  $('#nuevo').onclick = intentar(() => formEquipo());
  $('#main').onclick = intentar(async (ev) => {
    if (ev.target.dataset.e) await formEquipo(lista.find((x) => x.id == ev.target.dataset.e));
    if (ev.target.dataset.d && confirmar('¿Eliminar este equipo?')) { await api('/equipos/' + ev.target.dataset.d, 'DELETE'); toast('Equipo eliminado'); refrescar(); }
  });
}
async function formEquipo(e = {}) {
  const clientes = await api('/clientes');
  formulario(e.id ? 'Editar equipo' : 'Nuevo equipo', [
    { name: 'cliente_id', label: 'Cliente', type: 'select', required: true, value: e.cliente_id, options: [['', '-- Selecciona --'], ...clientes.map((c) => [c.id, c.nombre])] },
    { name: 'tipo', label: 'Tipo (laptop, impresora...)', required: true, value: e.tipo },
    { name: 'marca', label: 'Marca', value: e.marca },
    { name: 'modelo', label: 'Modelo', value: e.modelo },
    { name: 'serie', label: 'Número de serie', value: e.serie },
  ], async (d) => { await api(e.id ? '/equipos/' + e.id : '/equipos', e.id ? 'PUT' : 'POST', d); toast('Equipo guardado'); refrescar(); });
}

/* ---------- Usuarios ---------- */
async function vistaUsuarios() {
  const lista = await api('/usuarios');
  $('#main').innerHTML = `<div class="toolbar"><h2 class="grow">Usuarios</h2><button id="nuevo">+ Nuevo usuario</button></div>
    ${tabla(['Nombre', 'Email', 'Rol', 'Activo', ''], lista.map((u) => [esc(u.nombre), esc(u.email), esc(u.rol), u.activo ? 'Sí' : 'No',
      `<td class="actions"><button class="small" data-e="${u.id}">Editar</button><button class="small danger" data-d="${u.id}">Eliminar</button></td>`]))}`;
  $('#nuevo').onclick = () => formUsuario();
  $('#main').onclick = intentar(async (ev) => {
    if (ev.target.dataset.e) formUsuario(lista.find((u) => u.id == ev.target.dataset.e));
    if (ev.target.dataset.d && confirmar('¿Eliminar este usuario?')) { await api('/usuarios/' + ev.target.dataset.d, 'DELETE'); toast('Usuario eliminado'); refrescar(); }
  });
}
function formUsuario(u = {}) {
  formulario(u.id ? 'Editar usuario' : 'Nuevo usuario', [
    { name: 'nombre', label: 'Nombre', required: true, value: u.nombre },
    { name: 'email', label: 'Email', type: 'email', required: true, value: u.email },
    { name: 'password', label: u.id ? 'Nueva contraseña (opcional)' : 'Contraseña (mín. 6)', type: 'password', required: !u.id, pattern: '.{6,}' },
    { name: 'rol', label: 'Rol', type: 'select', required: true, value: u.rol || 'tecnico', options: [['tecnico', 'Técnico'], ['admin', 'Administrador']] },
    ...(u.id ? [{ name: 'activo', label: 'Activo', type: 'select', value: u.activo, options: [[1, 'Sí'], [0, 'No']] }] : []),
  ], async (d) => {
    if (u.id) { d.activo = +d.activo; if (!d.password) delete d.password; }
    await api(u.id ? '/usuarios/' + u.id : '/usuarios', u.id ? 'PUT' : 'POST', d); toast('Usuario guardado'); refrescar();
  });
}

/* ---------- Órdenes ---------- */
async function vistaOrdenes() {
  const q = $('#q-ord')?.value || '', est = $('#f-est')?.value || '';
  const lista = await api(`/ordenes?q=${encodeURIComponent(q)}&estado=${est}`);
  $('#main').innerHTML = `<div class="toolbar"><h2 class="grow">Órdenes de trabajo</h2>
    <input id="q-ord" placeholder="Código o cliente" value="${esc(q)}">
    <select id="f-est"><option value="">Todos los estados</option>${Object.entries(ESTADOS).map(([k, t]) => `<option value="${k}" ${k === est ? 'selected' : ''}>${t}</option>`).join('')}</select>
    ${esAdmin() ? '<button id="nuevo">+ Nueva orden</button>' : ''}</div>
    ${tabla(['Código', 'Cliente', 'Equipo', 'Técnico', 'Prioridad', 'Estado', 'Costo', ''], lista.map((o) => [esc(o.codigo), esc(o.cliente), esc(o.equipo), esc(o.tecnico || '—'),
      `<span class="badge ${o.prioridad}">${PRIORIDADES[o.prioridad]}</span>`, `<span class="badge ${o.estado}">${ESTADOS[o.estado]}</span>`, '$' + o.costo_total.toFixed(2),
      `<td class="actions"><button class="small" data-v="${o.id}">Ver</button>${esAdmin() ? `<button class="small" data-e="${o.id}">Editar</button><button class="small danger" data-d="${o.id}">Eliminar</button>` : ''}</td>`]))}`;
  $('#q-ord').onchange = refrescar; $('#f-est').onchange = refrescar;
  if (esAdmin()) $('#nuevo').onclick = intentar(() => formOrden());
  $('#main').onclick = intentar(async (e) => {
    const d = e.target.dataset;
    if (d.v) await detalleOrden(d.v);
    if (d.e) await formOrden(await api('/ordenes/' + d.e));
    if (d.d && confirmar('¿Eliminar esta orden y sus tareas?')) { await api('/ordenes/' + d.d, 'DELETE'); toast('Orden eliminada'); refrescar(); }
  });
}

async function formOrden(o = {}) {
  const [clientes, equipos, tecnicos] = await Promise.all([api('/clientes'), api('/equipos'), api('/tecnicos')]);
  formulario(o.id ? 'Editar ' + o.codigo : 'Nueva orden', [
    { name: 'cliente_id', label: 'Cliente', type: 'select', required: true, value: o.cliente_id, options: [['', '-- Selecciona --'], ...clientes.map((c) => [c.id, c.nombre])] },
    { name: 'equipo_id', label: 'Equipo', type: 'select', required: true, value: o.equipo_id, options: [['', '-- Selecciona --'], ...equipos.map((e) => [e.id, `${e.cliente} - ${e.tipo} ${e.marca || ''} ${e.serie ? '(' + e.serie + ')' : ''}`])] },
    { name: 'tecnico_id', label: 'Técnico asignado', type: 'select', value: o.tecnico_id, options: [['', '-- Sin asignar --'], ...tecnicos.map((t) => [t.id, t.nombre])] },
    { name: 'descripcion', label: 'Descripción del problema', type: 'textarea', required: true, value: o.descripcion },
    { name: 'prioridad', label: 'Prioridad', type: 'select', value: o.prioridad || 'media', options: Object.entries(PRIORIDADES) },
    { name: 'estado', label: 'Estado', type: 'select', value: o.estado || 'pendiente', options: Object.entries(ESTADOS) },
    { name: 'fecha_ingreso', label: 'Fecha de ingreso', type: 'date', value: o.fecha_ingreso },
    { name: 'fecha_entrega', label: 'Fecha de entrega', type: 'date', value: o.fecha_entrega },
  ], async (d) => {
    if (d.fecha_entrega && d.fecha_ingreso && d.fecha_entrega < d.fecha_ingreso) throw new Error('La entrega no puede ser anterior al ingreso');
    await api(o.id ? '/ordenes/' + o.id : '/ordenes', o.id ? 'PUT' : 'POST', d); toast('Orden guardada'); refrescar();
  });
}

async function detalleOrden(id) {
  const o = await api('/ordenes/' + id);
  const filas = o.tareas.map((t) => [
    `<input type="checkbox" data-c="${t.id}" ${t.completada ? 'checked' : ''}> ${esc(t.descripcion)}`, t.horas, '$' + t.costo.toFixed(2),
    `<td><button class="small danger" data-dt="${t.id}">Quitar</button></td>`]);
  $('#main').innerHTML = `<div class="toolbar"><button class="secondary" id="volver">&larr; Volver</button><h2 class="grow">${esc(o.codigo)}</h2>
      <select id="cambiar-estado">${Object.entries(ESTADOS).map(([k, t]) => `<option value="${k}" ${k === o.estado ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
    <div class="card"><div class="detail">
      <div><span>Cliente</span>${esc(o.cliente)}</div><div><span>Equipo</span>${esc(o.equipo)}</div>
      <div><span>Técnico</span>${esc(o.tecnico || '—')}</div><div><span>Prioridad</span>${PRIORIDADES[o.prioridad]}</div>
      <div><span>Ingreso</span>${esc(o.fecha_ingreso)}</div><div><span>Entrega</span>${esc(o.fecha_entrega || '—')}</div>
      <div><span>Costo total</span>$${o.costo_total.toFixed(2)}</div></div>
      <p>${esc(o.descripcion)}</p></div>
    <div class="row" style="margin:1rem 0 .5rem"><h3>Tareas</h3><button id="nueva-tarea">+ Agregar tarea</button></div>
    ${tabla(['Tarea', 'Horas', 'Costo', ''], filas)}`;
  $('#volver').onclick = () => ir('ordenes');
  const recargar = () => detalleOrden(id);
  $('#cambiar-estado').onchange = intentar(async (e) => { await api('/ordenes/' + id, 'PUT', { ...o, estado: e.target.value }); toast('Estado actualizado'); recargar(); });
  $('#nueva-tarea').onclick = () => formulario('Nueva tarea', [
    { name: 'descripcion', label: 'Descripción', required: true },
    { name: 'horas', label: 'Horas', type: 'number', min: 0, value: 0 },
    { name: 'costo', label: 'Costo ($)', type: 'number', min: 0, value: 0 },
  ], async (d) => { await api(`/ordenes/${id}/tareas`, 'POST', { ...d, horas: +d.horas, costo: +d.costo }); toast('Tarea agregada'); recargar(); });
  $('#main').onclick = intentar(async (e) => {
    if (e.target.dataset.c) { await api('/tareas/' + e.target.dataset.c, 'PUT', { completada: e.target.checked }); }
    if (e.target.dataset.dt && confirmar('¿Quitar tarea?')) { await api('/tareas/' + e.target.dataset.dt, 'DELETE'); recargar(); }
  });
}

/* ---------- Tabla genérica ---------- */
function tabla(cols, filas) {
  if (!filas.length) return '<div class="card empty">No hay registros.</div>';
  return `<table><thead><tr>${cols.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${
    filas.map((f) => `<tr>${f.map((c) => (String(c).startsWith('<td') ? c : `<td>${c ?? ''}</td>`)).join('')}</tr>`).join('')}</tbody></table>`;
}

if (sesion) iniciarApp();
