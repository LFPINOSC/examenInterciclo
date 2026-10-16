const express=require('express');
const pool=require('../db');
const { asyncHandler,fail }=require('../errors');
const { entero,validarViaje }=require('../validators/fields');
const { soloAdmin } = require('../middleware/auth');
const router=express.Router();
const select = `SELECT v.*, ve.placa AS vehiculo_placa, c.nombres AS conductor_nombre,
    (r.origen || ' → ' || r.destino) AS ruta_nombre, u.nombre AS registrado_por
    FROM viajes v JOIN vehiculos ve ON ve.id_vehiculo=v.id_vehiculo
    JOIN conductores c ON c.id_conductor=v.id_conductor
    JOIN rutas r ON r.id_ruta=v.id_ruta JOIN usuarios u ON u.id_usuario=v.id_usuario`;
router.get('/',asyncHandler(async(req,res)=>{
  const {rows}=await pool.query(`${select} ORDER BY v.fecha_salida DESC,v.id_viaje DESC`);
  res.json(rows);
}));
router.get('/:id',asyncHandler(async(req,res)=>{
  const id=entero(req.params.id,'ID');
  const {rows}=await pool.query(`${select} WHERE v.id_viaje=$1`,[id]);
  if(!rows.length) fail(404,'Viaje no encontrado.');
  res.json(rows[0]);
}));
// En una transacción bloqueamos conductor y vehículo en orden constante.
// Evita que dos peticiones concurrentes programen viajes superpuestos.
async function guardarViaje(req,res,id) {
  const d=validarViaje(req.body || {}), client=await pool.connect();
  try {
    await client.query('BEGIN');
    if(id) {
      const viejo=await client.query('SELECT id_viaje FROM viajes WHERE id_viaje=$1 FOR UPDATE',[id]);
      if(!viejo.rows.length) fail(404,'Viaje no encontrado.');
    }
    await client.query('SELECT pg_advisory_xact_lock(1,$1)',[d.id_vehiculo]);
    await client.query('SELECT pg_advisory_xact_lock(2,$1)',[d.id_conductor]);
    const checks=await client.query(`SELECT
      (SELECT estado FROM vehiculos WHERE id_vehiculo=$1) vehiculo,
      (SELECT estado FROM conductores WHERE id_conductor=$2) conductor,
      (SELECT estado FROM rutas WHERE id_ruta=$3) ruta`,[d.id_vehiculo,d.id_conductor,d.id_ruta]);
    const estado=checks.rows[0];
    if(!estado.vehiculo || !estado.conductor || !estado.ruta) fail(400,'Vehículo, conductor o ruta no existen.');
    if(['programado','en_curso'].includes(d.estado)) {
      if(estado.vehiculo!=='activo' || estado.conductor!=='activo' || estado.ruta!=='activo')
        fail(409,'Vehículo, conductor y ruta deben estar activos para programar o ejecutar un viaje.');
      const conflicto=await client.query(`SELECT id_viaje FROM viajes
        WHERE estado IN ('programado','en_curso') AND ($1::integer IS NULL OR id_viaje<>$1)
          AND (id_vehiculo=$2 OR id_conductor=$3)
          AND fecha_salida < $5::timestamptz
          AND fecha_llegada_prevista > $4::timestamptz LIMIT 1`,
          [id||null,d.id_vehiculo,d.id_conductor,d.fecha_salida,d.fecha_llegada_prevista]);
      if(conflicto.rows.length) fail(409,`Conflicto de horario con el viaje #${conflicto.rows[0].id_viaje}: conductor o vehículo ocupados.`);
    }
    let result;
    const vals=[d.id_vehiculo,d.id_conductor,d.id_ruta,d.fecha_salida,d.fecha_llegada_prevista,d.estado,d.observaciones];
    if(id) result=await client.query(`UPDATE viajes SET id_vehiculo=$1,id_conductor=$2,id_ruta=$3,
      fecha_salida=$4,fecha_llegada_prevista=$5,estado=$6,observaciones=$7
      WHERE id_viaje=$8 RETURNING *`,[...vals,id]);
    else result=await client.query(`INSERT INTO viajes
      (id_vehiculo,id_conductor,id_ruta,fecha_salida,fecha_llegada_prevista,estado,observaciones,id_usuario)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,[...vals,req.usuario.id_usuario]);
    await client.query('COMMIT');
    res.status(id?200:201).json(result.rows[0]);
  }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}
router.post('/',asyncHandler(async(req,res)=>guardarViaje(req,res,null)));
router.put('/:id',asyncHandler(async(req,res)=>guardarViaje(req,res,entero(req.params.id,'ID'))));
router.delete('/:id',soloAdmin,asyncHandler(async(req,res)=>{
  const id=entero(req.params.id,'ID');
  const {rowCount}=await pool.query('DELETE FROM viajes WHERE id_viaje=$1',[id]);
  if(!rowCount) fail(404,'Viaje no encontrado.');
  res.json({message:'Viaje eliminado.'});
}));
module.exports=router;
