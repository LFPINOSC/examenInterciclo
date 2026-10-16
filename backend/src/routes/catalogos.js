const express = require('express');
const pool = require('../db');
const { asyncHandler, fail } = require('../errors');
const { entero, validarVehiculo, validarConductor, validarRuta } = require('../validators/fields');
const { soloAdmin } = require('../middleware/auth');
const { verificarSinViajes } = require('../services/integridad');

// Las tablas y columnas son constantes internas, NUNCA texto ingresado por el usuario.
const catalogos = {
  vehiculos: { tabla:'vehiculos', pk:'id_vehiculo', campos:['placa','marca','modelo','capacidad','estado'], validar:validarVehiculo },
  conductores: { tabla:'conductores', pk:'id_conductor', campos:['nombres','licencia','telefono','estado'], validar:validarConductor },
  rutas: { tabla:'rutas', pk:'id_ruta', campos:['origen','destino','distancia_km','estado'], validar:validarRuta }
};
function crearRouter(tipo) {
  const cfg=catalogos[tipo], router=express.Router();
  router.get('/', asyncHandler(async(req,res) => {
    const {rows}=await pool.query(`SELECT * FROM ${cfg.tabla} ORDER BY ${cfg.pk} DESC`);
    res.json(rows);
  }));
  router.get('/:id',asyncHandler(async(req,res) => {
    const id=entero(req.params.id,'ID');
    const {rows}=await pool.query(`SELECT * FROM ${cfg.tabla} WHERE ${cfg.pk}=$1`,[id]);
    if(!rows.length) fail(404,'Registro no encontrado.');
    res.json(rows[0]);
  }));
  router.post('/',soloAdmin,asyncHandler(async(req,res) => {
    const datos=cfg.validar(req.body || {});
    const p=cfg.campos.map((_,i)=>`$${i+1}`).join(',');
    const {rows}=await pool.query(`INSERT INTO ${cfg.tabla} (${cfg.campos.join(',')}) VALUES (${p}) RETURNING *`,cfg.campos.map(c=>datos[c]));
    res.status(201).json(rows[0]);
  }));
  router.put('/:id',soloAdmin,asyncHandler(async(req,res) => {
    const id=entero(req.params.id,'ID'), datos=cfg.validar(req.body||{});
    const sets=cfg.campos.map((c,i)=>`${c}=$${i+1}`).join(',');
    const valores=cfg.campos.map(c=>datos[c]);
    const {rows}=await pool.query(`UPDATE ${cfg.tabla} SET ${sets} WHERE ${cfg.pk}=$${valores.length+1} RETURNING *`,[...valores,id]);
    if(!rows.length) fail(404,'Registro no encontrado.');
    res.json(rows[0]);
  }));
  router.delete('/:id',soloAdmin,asyncHandler(async(req,res) => {
    const id=entero(req.params.id,'ID');
    await verificarSinViajes(pool, tipo, id);
    const {rowCount}=await pool.query(`DELETE FROM ${cfg.tabla} WHERE ${cfg.pk}=$1`,[id]);
    if(!rowCount) fail(404,'Registro no encontrado.');
    res.json({message:'Registro eliminado correctamente.'});
  }));
  return router;
}
module.exports = { crearRouter };
