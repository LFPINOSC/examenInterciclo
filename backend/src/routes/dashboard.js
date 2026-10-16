const express = require('express');
const { db } = require('../db');
const { autenticar } = require('../middleware');

const router = express.Router();
router.use(autenticar);

const movimiento = `
  SELECT h.id_hospitalizacion AS id, h.codigo, h.fecha_ingreso AS fechaIngreso,
    h.diagnostico_ingreso AS diagnosticoIngreso, h.estado,
    p.nombres || ' ' || p.apellidos AS pacienteNombre,
    hab.numero AS habitacionNumero, h.medico_responsable AS medicoNombre
  FROM hospitalizaciones h
  JOIN pacientes p ON p.id_paciente = h.id_paciente
  JOIN habitaciones hab ON hab.id_habitacion = h.id_habitacion
`;

const camas = `
  SELECT hab.id_habitacion AS id, hab.numero, hab.piso, hab.tipo, hab.estado,
    p.nombres || ' ' || p.apellidos AS pacienteNombre
  FROM habitaciones hab
  LEFT JOIN hospitalizaciones h ON h.id_habitacion = hab.id_habitacion AND h.estado = 'ACTIVA'
  LEFT JOIN pacientes p ON p.id_paciente = h.id_paciente
`;

router.get('/', (req, res) => {
  if (req.usuario.rol === 'MEDICO') {
    const activas = db.prepare(
      `${movimiento} WHERE h.estado = 'ACTIVA' AND h.medico_responsable = ? ORDER BY h.fecha_ingreso`
    ).all(req.usuario.nombre);
    return res.json({ tipo: 'medico', activas });
  }

  if (req.usuario.rol === 'RECEPCION') {
    const libres = db.prepare(`${camas} WHERE hab.estado = 'DISPONIBLE' ORDER BY hab.piso, hab.numero`).all();
    const activas = db.prepare(`${movimiento} WHERE h.estado = 'ACTIVA' ORDER BY h.fecha_ingreso`).all();
    return res.json({ tipo: 'recepcion', libres, activas });
  }

  const resumen = db.prepare(
    `SELECT
      (SELECT COUNT(*) FROM pacientes) AS pacientes,
      (SELECT COUNT(*) FROM hospitalizaciones WHERE estado = 'ACTIVA') AS activas,
      (SELECT COUNT(*) FROM habitaciones WHERE estado = 'DISPONIBLE') AS disponibles,
      (SELECT COUNT(*) FROM habitaciones WHERE estado = 'OCUPADA') AS ocupadas,
      (SELECT COUNT(*) FROM habitaciones) AS habitaciones`
  ).get();
  const recientes = db.prepare(`${movimiento} ORDER BY h.fecha_ingreso DESC LIMIT 5`).all();
  const habitaciones = db.prepare(`${camas} ORDER BY hab.piso, hab.numero`).all();
  return res.json({ tipo: 'admin', resumen, recientes, habitaciones });
});

module.exports = router;
