const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { soloAdmin } = require('../middleware/auth');
const { asyncHandler, fail } = require('../errors');
const { entero, validarUsuario } = require('../validators/fields');
const router = express.Router();
router.use(soloAdmin);
router.get('/',asyncHandler(async(req,res) => {
  const {rows}=await pool.query('SELECT id_usuario,nombre,correo,rol,activo,creado_en FROM usuarios ORDER BY id_usuario DESC');
  res.json(rows);
}));
router.get('/:id',asyncHandler(async(req,res) => {
  const id=entero(req.params.id,'ID');
  const {rows}=await pool.query('SELECT id_usuario,nombre,correo,rol,activo,creado_en FROM usuarios WHERE id_usuario=$1',[id]);
  if(!rows.length) fail(404,'Usuario no encontrado.');
  res.json(rows[0]);
}));
router.post('/',asyncHandler(async(req,res) => {
  const d=validarUsuario(req.body||{},true);
  const hash=await bcrypt.hash(d.password,12);
  const {rows}=await pool.query('INSERT INTO usuarios (nombre,correo,password_hash,rol,activo) VALUES($1,$2,$3,$4,$5) RETURNING id_usuario,nombre,correo,rol,activo,creado_en',
    [d.nombre,d.correo,hash,d.rol,d.activo]);
  res.status(201).json(rows[0]);
}));
router.put('/:id',asyncHandler(async(req,res) => {
  const id=entero(req.params.id,'ID'),d=validarUsuario(req.body||{},false);
  if(id===req.usuario.id_usuario && (!d.activo || d.rol !== 'admin')) fail(400,'No puedes desactivar o quitar el rol administrador a tu propia cuenta.');
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    const orig=await client.query('SELECT rol,activo FROM usuarios WHERE id_usuario=$1 FOR UPDATE',[id]);
    if(!orig.rows.length) fail(404,'Usuario no encontrado.');
    if(orig.rows[0].rol==='admin' && orig.rows[0].activo && (!d.activo || d.rol!=='admin')) {
      const {rows}=await client.query("SELECT COUNT(*)::int AS total FROM usuarios WHERE rol='admin' AND activo=TRUE");
      if(rows[0].total<=1) fail(400,'Debe permanecer al menos un administrador activo.');
    }
    const hash=d.password? await bcrypt.hash(d.password,12):null;
    const r=await client.query(`UPDATE usuarios SET nombre=$1,correo=$2,rol=$3,activo=$4,
      password_hash=COALESCE($5,password_hash) WHERE id_usuario=$6
      RETURNING id_usuario,nombre,correo,rol,activo,creado_en`,[d.nombre,d.correo,d.rol,d.activo,hash,id]);
    await client.query('COMMIT');
    res.json(r.rows[0]);
  } catch(e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
}));
router.delete('/:id',asyncHandler(async(req,res) => {
  const id=entero(req.params.id,'ID');
  if(id===req.usuario.id_usuario) fail(400,'No puedes eliminar tu propia cuenta.');
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    const orig=await client.query('SELECT rol,activo FROM usuarios WHERE id_usuario=$1 FOR UPDATE',[id]);
    if(!orig.rows.length) fail(404,'Usuario no encontrado.');
    if(orig.rows[0].rol==='admin' && orig.rows[0].activo) {
      const {rows}=await client.query("SELECT COUNT(*)::int AS total FROM usuarios WHERE rol='admin' AND activo=TRUE");
      if(rows[0].total<=1) fail(400,'No puedes eliminar al último administrador activo.');
    }
    await client.query('DELETE FROM usuarios WHERE id_usuario=$1',[id]);
    await client.query('COMMIT');
    res.json({message:'Usuario eliminado.'});
  } catch(e){await client.query('ROLLBACK');throw e;} finally{client.release();}
}));
module.exports = router;
