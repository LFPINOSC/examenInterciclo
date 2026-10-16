const express = require('express');
const { db } = require('../db');
const { autenticar } = require('../middleware');

const router = express.Router();
router.use(autenticar);

const consultaHospitalizacion = `
  SELECT
    h.id_hospitalizacion AS id,
    h.codigo,
    h.fecha_ingreso AS fechaIngreso,
    h.fecha_alta AS fechaAlta,
    h.diagnostico_ingreso AS diagnosticoIngreso,
    h.estado,
    p.nombres || ' ' || p.apellidos AS pacienteNombre,
    hab.numero AS habitacionNumero,
    hab.tipo AS habitacionTipo,
    m.nombres || ' ' || m.apellidos AS medicoNombre
  FROM hospitalizaciones h
  JOIN pacientes p ON p.id_paciente = h.id_paciente
  JOIN habitaciones hab ON hab.id_habitacion = h.id_habitacion
  JOIN medicos m ON m.id_medico = h.id_medico
`;

router.get('/', (req, res) => {
  const resumen = db.prepare(
    `SELECT
      (SELECT COUNT(*) FROM pacientes) AS pacientes,
      (SELECT COUNT(*) FROM medicos) AS medicos,
      (SELECT COUNT(*) FROM hospitalizaciones WHERE estado = 'ACTIVA') AS activas,
      (SELECT COUNT(*) FROM hospitalizaciones WHERE estado = 'ALTA') AS altas,
      (SELECT COUNT(*) FROM habitaciones WHERE estado = 'DISPONIBLE') AS disponibles,
      (SELECT COUNT(*) FROM habitaciones WHERE estado = 'OCUPADA') AS ocupadas,
      (SELECT COUNT(*) FROM habitaciones WHERE estado = 'MANTENIMIENTO') AS mantenimiento,
      (SELECT COUNT(*) FROM habitaciones) AS habitaciones`
  ).get();

  const recientes = db.prepare(
    `${consultaHospitalizacion} ORDER BY h.fecha_ingreso DESC, h.id_hospitalizacion DESC LIMIT 5`
  ).all();

  const habitaciones = db.prepare(
    `SELECT
      hab.id_habitacion AS id,
      hab.numero,
      hab.piso,
      hab.tipo,
      hab.estado,
      p.nombres || ' ' || p.apellidos AS pacienteNombre
    FROM habitaciones hab
    LEFT JOIN hospitalizaciones h ON h.id_habitacion = hab.id_habitacion AND h.estado = 'ACTIVA'
    LEFT JOIN pacientes p ON p.id_paciente = h.id_paciente
    ORDER BY hab.piso, hab.numero`
  ).all();

  return res.json({ resumen, recientes, habitaciones });
});

module.exports = router;
