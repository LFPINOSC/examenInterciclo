const express = require('express');
const { db, transaccion } = require('../db');
const { autenticar, permitir } = require('../middleware');
const { texto, fecha, opcional, idParam, enteroPositivo, MOTIVOS_ALTA } = require('../validators');

const router = express.Router();
router.use(autenticar);

const consulta = `
  SELECT
    h.id_hospitalizacion AS id,
    h.codigo,
    h.fecha_ingreso AS fechaIngreso,
    h.fecha_alta AS fechaAlta,
    h.diagnostico_ingreso AS diagnosticoIngreso,
    h.diagnostico_alta AS diagnosticoAlta,
    h.motivo_alta AS motivoAlta,
    h.estado,
    h.observaciones,
    h.medico_responsable AS medicoResponsable,
    h.id_paciente AS pacienteId,
    p.cedula AS pacienteCedula,
    p.nombres || ' ' || p.apellidos AS pacienteNombre,
    h.id_habitacion AS habitacionId,
    hab.numero AS habitacionNumero,
    hab.piso AS habitacionPiso,
    hab.tipo AS habitacionTipo
  FROM hospitalizaciones h
  JOIN pacientes p ON p.id_paciente = h.id_paciente
  JOIN habitaciones hab ON hab.id_habitacion = h.id_habitacion
`;

function obtener(id) {
  return db.prepare(`${consulta} WHERE h.id_hospitalizacion = ?`).get(id);
}

function esSuPaciente(usuario, medicoResponsable) {
  return usuario.rol !== 'MEDICO' || medicoResponsable === usuario.nombre;
}

function siguienteCodigo() {
  const fila = db.prepare(
    `SELECT COALESCE(MAX(CAST(SUBSTR(codigo, 5) AS INTEGER)), 0) + 1 AS n FROM hospitalizaciones`
  ).get();
  return `HSP-${String(fila.n).padStart(4, '0')}`;
}

function habitacionLibre(idHabitacion) {
  const habitacion = db.prepare('SELECT * FROM habitaciones WHERE id_habitacion = ?').get(idHabitacion);
  if (!habitacion) return { error: 'La habitación no existe' };
  if (habitacion.estado !== 'DISPONIBLE') return { error: 'La habitación no está disponible' };
  const ocupante = db.prepare(
    `SELECT codigo FROM hospitalizaciones WHERE id_habitacion = ? AND estado = 'ACTIVA'`
  ).get(idHabitacion);
  if (ocupante) return { error: `La habitación está ocupada (${ocupante.codigo})` };
  return { habitacion };
}

router.get('/', (req, res) => {
  const estado = String(req.query.estado ?? '');
  const q = String(req.query.q ?? '').trim().replace(/[%_]/g, '');
  const filtros = [];
  const params = [];
  if (estado) {
    if (!['ACTIVA', 'ALTA'].includes(estado)) return res.status(400).json({ message: 'Estado inválido' });
    filtros.push('h.estado = ?');
    params.push(estado);
  }
  if (q) {
    filtros.push(`(
      h.codigo LIKE ? OR p.cedula LIKE ? OR p.nombres LIKE ? OR p.apellidos LIKE ?
      OR hab.numero LIKE ? OR h.diagnostico_ingreso LIKE ? OR h.medico_responsable LIKE ?
    )`);
    const like = `%${q}%`;
    params.push(like, like, like, like, like, like, like);
  }
  if (req.usuario.rol === 'MEDICO') {
    filtros.push('h.medico_responsable = ?');
    params.push(req.usuario.nombre);
  }
  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
  return res.json(
    db.prepare(`${consulta} ${where} ORDER BY h.fecha_ingreso DESC`).all(...params)
  );
});

router.post('/', permitir('ADMIN', 'RECEPCION'), (req, res) => {
  const pacienteId = enteroPositivo(req.body?.pacienteId, 'Paciente');
  const habitacionId = enteroPositivo(req.body?.habitacionId, 'Habitación');
  const medico = texto(req.body?.medicoResponsable, { min: 3, max: 120, campo: 'Médico responsable' });
  const fechaIngreso = fecha(req.body?.fechaIngreso, 'Fecha de ingreso');
  const diagnostico = texto(req.body?.diagnosticoIngreso, { min: 3, max: 240, campo: 'Diagnóstico' });
  const observaciones = opcional(req.body?.observaciones, 400);
  const falla = [pacienteId, habitacionId, medico, fechaIngreso, diagnostico, observaciones].find((x) => x.error);
  if (falla) return res.status(400).json({ message: falla.error });

  if (!db.prepare('SELECT id_paciente FROM pacientes WHERE id_paciente = ?').get(pacienteId.valor)) {
    return res.status(404).json({ message: 'Paciente no encontrado' });
  }
  const activa = db.prepare(
    `SELECT codigo FROM hospitalizaciones WHERE id_paciente = ? AND estado = 'ACTIVA'`
  ).get(pacienteId.valor);
  if (activa) return res.status(409).json({ message: `Ya tiene ingreso activo (${activa.codigo})` });

  try {
    const id = transaccion(() => {
      const libre = habitacionLibre(habitacionId.valor);
      if (libre.error) {
        const error = new Error(libre.error);
        error.status = 409;
        throw error;
      }
      const codigo = siguienteCodigo();
      const r = db.prepare(
        `INSERT INTO hospitalizaciones (
          codigo, id_paciente, id_habitacion, medico_responsable, fecha_ingreso,
          diagnostico_ingreso, estado, observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVA', ?)`
      ).run(
        codigo, pacienteId.valor, habitacionId.valor, medico.valor,
        fechaIngreso.valor, diagnostico.valor, observaciones.valor
      );
      db.prepare(`UPDATE habitaciones SET estado = 'OCUPADA' WHERE id_habitacion = ?`).run(habitacionId.valor);
      return Number(r.lastInsertRowid);
    });
    return res.status(201).json(obtener(id));
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo registrar' });
  }
});

router.put('/:id', permitir('ADMIN', 'MEDICO'), (req, res) => {
  const id = idParam(req.params.id);
  const actual = id ? db.prepare('SELECT * FROM hospitalizaciones WHERE id_hospitalizacion = ?').get(id) : null;
  if (!actual) return res.status(404).json({ message: 'No encontrada' });
  if (!esSuPaciente(req.usuario, actual.medico_responsable)) {
    return res.status(403).json({ message: 'No es su paciente' });
  }

  const diagnostico = texto(req.body?.diagnosticoIngreso, { min: 3, max: 240, campo: 'Diagnóstico' });
  const observaciones = opcional(req.body?.observaciones, 400);
  const falla = [diagnostico, observaciones].find((x) => x.error);
  if (falla) return res.status(400).json({ message: falla.error });

  db.prepare(
    `UPDATE hospitalizaciones SET diagnostico_ingreso = ?, observaciones = ? WHERE id_hospitalizacion = ?`
  ).run(diagnostico.valor, observaciones.valor, id);
  return res.json(obtener(id));
});

router.post('/:id/alta', permitir('ADMIN', 'MEDICO'), (req, res) => {
  const id = idParam(req.params.id);
  const actual = id ? db.prepare('SELECT * FROM hospitalizaciones WHERE id_hospitalizacion = ?').get(id) : null;
  if (!actual) return res.status(404).json({ message: 'No encontrada' });
  if (!esSuPaciente(req.usuario, actual.medico_responsable)) {
    return res.status(403).json({ message: 'No es su paciente' });
  }
  if (actual.estado !== 'ACTIVA') return res.status(409).json({ message: 'Ya tiene alta' });

  const fechaAlta = fecha(req.body?.fechaAlta, 'Fecha de alta');
  const diagnosticoAlta = texto(req.body?.diagnosticoAlta, { min: 3, max: 240, campo: 'Diagnóstico de alta' });
  const motivo = String(req.body?.motivoAlta ?? '');
  const falla = [fechaAlta, diagnosticoAlta].find((x) => x.error);
  if (falla) return res.status(400).json({ message: falla.error });
  if (!MOTIVOS_ALTA.includes(motivo)) return res.status(400).json({ message: 'Motivo inválido' });

  transaccion(() => {
    db.prepare(
      `UPDATE hospitalizaciones SET estado = 'ALTA', fecha_alta = ?, diagnostico_alta = ?, motivo_alta = ? WHERE id_hospitalizacion = ?`
    ).run(fechaAlta.valor, diagnosticoAlta.valor, motivo, id);
    db.prepare(`UPDATE habitaciones SET estado = 'DISPONIBLE' WHERE id_habitacion = ?`).run(actual.id_habitacion);
  });
  return res.json(obtener(id));
});

module.exports = router;
