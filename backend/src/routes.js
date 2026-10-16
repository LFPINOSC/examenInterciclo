const express = require('express');
const bcrypt = require('bcryptjs');
const { db, envolver } = require('./crud');
const { firmar, requiereAuth, requiereRol } = require('./auth');
const { requeridos, emailOk, cedulaOk, vacio } = require('./validar');

const r = express.Router();
const soloAdmin = requiereRol('admin');
const bad = (res, msg) => res.status(400).json({ error: msg });
const noExiste = (res) => res.status(404).json({ error: 'Registro no encontrado' });

/* ---------- AUTH ---------- */
r.post('/auth/login', envolver((req, res) => {
  const { email, password } = req.body;
  if (vacio(email) || vacio(password)) return bad(res, 'Email y contraseña son obligatorios');
  const u = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
  if (!u || !u.activo || !bcrypt.compareSync(password, u.password_hash))
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  res.json({ token: firmar(u), usuario: { id: u.id, nombre: u.nombre, rol: u.rol } });
}));

r.use(requiereAuth); // todo lo de abajo exige sesión

/* ---------- USUARIOS (solo admin; /tecnicos lo puede ver cualquiera) ---------- */
r.get('/tecnicos', envolver((req, res) => {
  res.json(db.prepare("SELECT id, nombre FROM usuarios WHERE rol='tecnico' AND activo=1 ORDER BY nombre").all());
}));
r.get('/usuarios', soloAdmin, envolver((req, res) => {
  res.json(db.prepare('SELECT id, nombre, email, rol, activo, creado_en FROM usuarios ORDER BY id').all());
}));
r.post('/usuarios', soloAdmin, envolver((req, res) => {
  const e = requeridos(req.body, ['nombre', 'email', 'password', 'rol']);
  if (e) return bad(res, e);
  const { nombre, email, password, rol } = req.body;
  if (!emailOk(email)) return bad(res, 'Email inválido');
  if (password.length < 6) return bad(res, 'La contraseña debe tener al menos 6 caracteres');
  if (!['admin', 'tecnico'].includes(rol)) return bad(res, 'Rol inválido');
  const info = db.prepare('INSERT INTO usuarios (nombre,email,password_hash,rol) VALUES (?,?,?,?)')
    .run(nombre.trim(), email.trim(), bcrypt.hashSync(password, 10), rol);
  res.status(201).json({ id: info.lastInsertRowid });
}));
r.put('/usuarios/:id', soloAdmin, envolver((req, res) => {
  const u = db.prepare('SELECT * FROM usuarios WHERE id=?').get(req.params.id);
  if (!u) return noExiste(res);
  const { nombre = u.nombre, email = u.email, rol = u.rol, activo = u.activo, password } = req.body;
  if (!emailOk(email)) return bad(res, 'Email inválido');
  if (!['admin', 'tecnico'].includes(rol)) return bad(res, 'Rol inválido');
  if (password && password.length < 6) return bad(res, 'La contraseña debe tener al menos 6 caracteres');
  if (u.id === req.user.id && (!activo || rol !== 'admin')) return bad(res, 'No puedes desactivarte ni quitarte el rol admin');
  const hash = password ? bcrypt.hashSync(password, 10) : u.password_hash;
  db.prepare('UPDATE usuarios SET nombre=?, email=?, rol=?, activo=?, password_hash=? WHERE id=?')
    .run(nombre, email, rol, activo ? 1 : 0, hash, u.id);
  res.json({ ok: true });
}));
r.delete('/usuarios/:id', soloAdmin, envolver((req, res) => {
  if (+req.params.id === req.user.id) return bad(res, 'No puedes eliminarte a ti mismo');
  const i = db.prepare('DELETE FROM usuarios WHERE id=?').run(req.params.id);
  i.changes ? res.json({ ok: true }) : noExiste(res);
}));

/* ---------- CLIENTES ---------- */
function validarCliente(b) {
  const e = requeridos(b, ['nombre', 'cedula']);
  if (e) return e;
  if (!cedulaOk(b.cedula)) return 'Cédula ecuatoriana inválida';
  if (!vacio(b.email) && !emailOk(b.email)) return 'Email inválido';
  if (!vacio(b.telefono) && !/^\d{7,10}$/.test(b.telefono)) return 'Teléfono inválido (7 a 10 dígitos)';
  return null;
}
r.get('/clientes', envolver((req, res) => {
  const q = `%${req.query.q || ''}%`;
  res.json(db.prepare('SELECT * FROM clientes WHERE nombre LIKE ? OR cedula LIKE ? ORDER BY nombre').all(q, q));
}));
r.get('/clientes/:id', envolver((req, res) => {
  const c = db.prepare('SELECT * FROM clientes WHERE id=?').get(req.params.id);
  c ? res.json(c) : noExiste(res);
}));
r.post('/clientes', soloAdmin, envolver((req, res) => {
  const e = validarCliente(req.body); if (e) return bad(res, e);
  const { nombre, cedula, telefono, email, direccion } = req.body;
  const i = db.prepare('INSERT INTO clientes (nombre,cedula,telefono,email,direccion) VALUES (?,?,?,?,?)')
    .run(nombre.trim(), cedula, telefono || null, email || null, direccion || null);
  res.status(201).json({ id: i.lastInsertRowid });
}));
r.put('/clientes/:id', soloAdmin, envolver((req, res) => {
  const e = validarCliente(req.body); if (e) return bad(res, e);
  const { nombre, cedula, telefono, email, direccion } = req.body;
  const i = db.prepare('UPDATE clientes SET nombre=?, cedula=?, telefono=?, email=?, direccion=? WHERE id=?')
    .run(nombre.trim(), cedula, telefono || null, email || null, direccion || null, req.params.id);
  i.changes ? res.json({ ok: true }) : noExiste(res);
}));
r.delete('/clientes/:id', soloAdmin, envolver((req, res) => {
  const i = db.prepare('DELETE FROM clientes WHERE id=?').run(req.params.id);
  i.changes ? res.json({ ok: true }) : noExiste(res);
}));

/* ---------- EQUIPOS ---------- */
r.get('/equipos', envolver((req, res) => {
  const cid = req.query.cliente_id;
  const sql = `SELECT e.*, c.nombre AS cliente FROM equipos e JOIN clientes c ON c.id=e.cliente_id
               ${cid ? 'WHERE e.cliente_id=?' : ''} ORDER BY c.nombre, e.tipo`;
  res.json(cid ? db.prepare(sql).all(cid) : db.prepare(sql).all());
}));
r.post('/equipos', soloAdmin, envolver((req, res) => {
  const e = requeridos(req.body, ['cliente_id', 'tipo']); if (e) return bad(res, e);
  const { cliente_id, tipo, marca, modelo, serie } = req.body;
  const i = db.prepare('INSERT INTO equipos (cliente_id,tipo,marca,modelo,serie) VALUES (?,?,?,?,?)')
    .run(cliente_id, tipo.trim(), marca || null, modelo || null, vacio(serie) ? null : serie.trim());
  res.status(201).json({ id: i.lastInsertRowid });
}));
r.put('/equipos/:id', soloAdmin, envolver((req, res) => {
  const e = requeridos(req.body, ['cliente_id', 'tipo']); if (e) return bad(res, e);
  const { cliente_id, tipo, marca, modelo, serie } = req.body;
  const i = db.prepare('UPDATE equipos SET cliente_id=?, tipo=?, marca=?, modelo=?, serie=? WHERE id=?')
    .run(cliente_id, tipo.trim(), marca || null, modelo || null, vacio(serie) ? null : serie.trim(), req.params.id);
  i.changes ? res.json({ ok: true }) : noExiste(res);
}));
r.delete('/equipos/:id', soloAdmin, envolver((req, res) => {
  const i = db.prepare('DELETE FROM equipos WHERE id=?').run(req.params.id);
  i.changes ? res.json({ ok: true }) : noExiste(res);
}));

/* ---------- ÓRDENES DE TRABAJO ---------- */
const ESTADOS = ['pendiente', 'en_proceso', 'completada', 'cancelada'];
const PRIORIDADES = ['baja', 'media', 'alta'];
const SELECT_ORDEN = `
  SELECT o.*, c.nombre AS cliente, e.tipo || ' ' || COALESCE(e.marca,'') AS equipo, u.nombre AS tecnico,
         (SELECT COALESCE(SUM(costo),0) FROM tareas WHERE orden_id=o.id) AS costo_total
  FROM ordenes_trabajo o
  JOIN clientes c ON c.id=o.cliente_id
  JOIN equipos  e ON e.id=o.equipo_id
  LEFT JOIN usuarios u ON u.id=o.tecnico_id`;

// El técnico solo accede a sus órdenes
const puedeVer = (req, o) => req.user.rol === 'admin' || o.tecnico_id === req.user.id;

r.get('/ordenes', envolver((req, res) => {
  const where = [], args = [];
  if (req.user.rol === 'tecnico') { where.push('o.tecnico_id=?'); args.push(req.user.id); }
  if (req.query.estado) { where.push('o.estado=?'); args.push(req.query.estado); }
  if (req.query.q) { where.push('(o.codigo LIKE ? OR c.nombre LIKE ?)'); args.push(`%${req.query.q}%`, `%${req.query.q}%`); }
  const sql = `${SELECT_ORDEN} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY o.id DESC`;
  res.json(db.prepare(sql).all(...args));
}));
r.get('/ordenes/:id', envolver((req, res) => {
  const o = db.prepare(`${SELECT_ORDEN} WHERE o.id=?`).get(req.params.id);
  if (!o) return noExiste(res);
  if (!puedeVer(req, o)) return res.status(403).json({ error: 'Esta orden no está asignada a ti' });
  o.tareas = db.prepare('SELECT * FROM tareas WHERE orden_id=? ORDER BY id').all(o.id);
  res.json(o);
}));

function validarOrden(b) {
  const e = requeridos(b, ['cliente_id', 'equipo_id', 'descripcion']);
  if (e) return e;
  if (b.prioridad && !PRIORIDADES.includes(b.prioridad)) return 'Prioridad inválida';
  if (b.estado && !ESTADOS.includes(b.estado)) return 'Estado inválido';
  if (b.fecha_entrega && b.fecha_ingreso && b.fecha_entrega < b.fecha_ingreso) return 'La fecha de entrega no puede ser anterior al ingreso';
  const eq = db.prepare('SELECT cliente_id FROM equipos WHERE id=?').get(b.equipo_id);
  if (!eq) return 'El equipo no existe';
  if (eq.cliente_id !== +b.cliente_id) return 'El equipo no pertenece al cliente seleccionado';
  return null;
}

r.post('/ordenes', soloAdmin, envolver((req, res) => {
  const e = validarOrden(req.body); if (e) return bad(res, e);
  const b = req.body;
  const tx = db.transaction(() => {
    const n = db.prepare('SELECT COALESCE(MAX(id),0)+1 AS n FROM ordenes_trabajo').get().n;
    const codigo = `OT-${String(n).padStart(5, '0')}`;
    return db.prepare(`INSERT INTO ordenes_trabajo
      (codigo,cliente_id,equipo_id,tecnico_id,descripcion,prioridad,estado,fecha_ingreso,fecha_entrega,creado_por)
      VALUES (?,?,?,?,?,?,?,COALESCE(?,date('now')),?,?)`)
      .run(codigo, b.cliente_id, b.equipo_id, b.tecnico_id || null, b.descripcion.trim(),
        b.prioridad || 'media', b.estado || 'pendiente', b.fecha_ingreso || null, b.fecha_entrega || null, req.user.id);
  });
  res.status(201).json({ id: tx().lastInsertRowid });
}));

r.put('/ordenes/:id', envolver((req, res) => {
  const o = db.prepare('SELECT * FROM ordenes_trabajo WHERE id=?').get(req.params.id);
  if (!o) return noExiste(res);
  if (req.user.rol === 'tecnico') {
    // El técnico solo puede cambiar el estado de SUS órdenes
    if (o.tecnico_id !== req.user.id) return res.status(403).json({ error: 'Esta orden no está asignada a ti' });
    if (!ESTADOS.includes(req.body.estado)) return bad(res, 'Estado inválido');
    db.prepare('UPDATE ordenes_trabajo SET estado=? WHERE id=?').run(req.body.estado, o.id);
    return res.json({ ok: true });
  }
  const e = validarOrden(req.body); if (e) return bad(res, e);
  const b = req.body;
  db.prepare(`UPDATE ordenes_trabajo SET cliente_id=?, equipo_id=?, tecnico_id=?, descripcion=?, prioridad=?,
              estado=?, fecha_ingreso=?, fecha_entrega=? WHERE id=?`)
    .run(b.cliente_id, b.equipo_id, b.tecnico_id || null, b.descripcion.trim(), b.prioridad || o.prioridad,
      b.estado || o.estado, b.fecha_ingreso || o.fecha_ingreso, b.fecha_entrega || null, o.id);
  res.json({ ok: true });
}));
r.delete('/ordenes/:id', soloAdmin, envolver((req, res) => {
  const i = db.prepare('DELETE FROM ordenes_trabajo WHERE id=?').run(req.params.id);
  i.changes ? res.json({ ok: true }) : noExiste(res);
}));

/* ---------- TAREAS (de una orden) ---------- */
function ordenAccesible(req, res, ordenId) {
  const o = db.prepare('SELECT * FROM ordenes_trabajo WHERE id=?').get(ordenId);
  if (!o) { noExiste(res); return null; }
  if (!puedeVer(req, o)) { res.status(403).json({ error: 'Esta orden no está asignada a ti' }); return null; }
  return o;
}
function validarTarea(b) {
  const e = requeridos(b, ['descripcion']); if (e) return e;
  if (b.horas !== undefined && (isNaN(b.horas) || +b.horas < 0)) return 'Horas inválidas';
  if (b.costo !== undefined && (isNaN(b.costo) || +b.costo < 0)) return 'Costo inválido';
  return null;
}
r.post('/ordenes/:id/tareas', envolver((req, res) => {
  if (!ordenAccesible(req, res, req.params.id)) return;
  const e = validarTarea(req.body); if (e) return bad(res, e);
  const { descripcion, horas = 0, costo = 0 } = req.body;
  const i = db.prepare('INSERT INTO tareas (orden_id,descripcion,horas,costo) VALUES (?,?,?,?)')
    .run(req.params.id, descripcion.trim(), +horas, +costo);
  res.status(201).json({ id: i.lastInsertRowid });
}));
r.put('/tareas/:id', envolver((req, res) => {
  const t = db.prepare('SELECT * FROM tareas WHERE id=?').get(req.params.id);
  if (!t) return noExiste(res);
  if (!ordenAccesible(req, res, t.orden_id)) return;
  const b = { ...t, ...req.body };
  const e = validarTarea(b); if (e) return bad(res, e);
  db.prepare('UPDATE tareas SET descripcion=?, horas=?, costo=?, completada=? WHERE id=?')
    .run(b.descripcion.trim(), +b.horas, +b.costo, b.completada ? 1 : 0, t.id);
  res.json({ ok: true });
}));
r.delete('/tareas/:id', envolver((req, res) => {
  const t = db.prepare('SELECT * FROM tareas WHERE id=?').get(req.params.id);
  if (!t) return noExiste(res);
  if (!ordenAccesible(req, res, t.orden_id)) return;
  db.prepare('DELETE FROM tareas WHERE id=?').run(t.id);
  res.json({ ok: true });
}));

/* ---------- RESUMEN (dashboard) ---------- */
r.get('/resumen', envolver((req, res) => {
  const filtro = req.user.rol === 'tecnico' ? 'WHERE tecnico_id=?' : '';
  const args = req.user.rol === 'tecnico' ? [req.user.id] : [];
  const por_estado = db.prepare(`SELECT estado, COUNT(*) AS total FROM ordenes_trabajo ${filtro} GROUP BY estado`).all(...args);
  res.json({ por_estado });
}));

module.exports = r;
