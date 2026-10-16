const express = require('express');
const { db, transaccion } = require('../db');
const { autenticar, permitir } = require('../middleware');
const {
  texto, fecha, opcional, idParam, enteroPositivo, MOTIVOS_ALTA,
} = require('../validators');

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
    h.id_paciente AS pacienteId,
    p.cedula AS pacienteCedula,
    p.nombres || ' ' || p.apellidos AS pacienteNombre,
    h.id_habitacion AS habitacionId,
    hab.numero AS habitacionNumero,
    hab.piso AS habitacionPiso,
    hab.tipo AS habitacionTipo,
    h.id_medico AS medicoId,
    m.nombres || ' ' || m.apellidos AS medicoNombre,
    m.especialidad AS medicoEspecialidad,
    m.id_usuario AS medicoUsuarioId
  FROM hospitalizaciones h
  JOIN pacientes p ON p.id_paciente = h.id_paciente
  JOIN habitaciones hab ON hab.id_habitacion = h.id_habitacion
  JOIN medicos m ON m.id_medico = h.id_medico
`;

function obtener(id) {
  return db.prepare(`${consulta} WHERE h.id_hospitalizacion = ?`).get(id);
}

function siguienteCodigo() {
  const fila = db.prepare(
    `SELECT COALESCE(MAX(CAST(SUBSTR(codigo, 5) AS INTEGER)), 0) + 1 AS siguiente FROM hospitalizaciones`
  ).get();
  return `HSP-${String(fila.siguiente).padStart(4, '0')}`;
}

function habitacionLibre(idHabitacion, exceptoId) {
  const habitacion = db.prepare('SELECT * FROM habitaciones WHERE id_habitacion = ?').get(idHabitacion);
  if (!habitacion) return { error: 'La habitación no existe' };
  if (habitacion.estado === 'MANTENIMIENTO') return { error: 'La habitación está en mantenimiento' };
  const ocupante = db.prepare(
    `SELECT codigo FROM hospitalizaciones
     WHERE id_habitacion = ? AND estado = 'ACTIVA' AND id_hospitalizacion != ?`
  ).get(idHabitacion, exceptoId ?? 0);
  if (ocupante) return { error: `La habitación ya está ocupada por ${ocupante.codigo}` };
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
      OR (p.nombres || ' ' || p.apellidos) LIKE ? OR hab.numero LIKE ? OR h.diagnostico_ingreso LIKE ?
    )`);
    const like = `%${q}%`;
    params.push(like, like, like, like, like, like, like);
  }
  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
  const filas = db.prepare(
    `${consulta} ${where} ORDER BY CASE h.estado WHEN 'ACTIVA' THEN 0 ELSE 1 END, h.fecha_ingreso DESC, h.id_hospitalizacion DESC`
  ).all(...params);
  return res.json(filas);
});

router.get('/:id', (req, res) => {
  const id = idParam(req.params.id);
  if (!id) return res.status(400).json({ message: 'Identificador inválido' });
  const fila = obtener(id);
  if (!fila) return res.status(404).json({ message: 'Hospitalización no encontrada' });
  return res.json(fila);
});

router.post('/', permitir('ADMIN', 'RECEPCION', 'MEDICO'), (req, res) => {
  const pacienteId = enteroPositivo(req.body?.pacienteId, 'Paciente');
  const habitacionId = enteroPositivo(req.body?.habitacionId, 'Habitación');
  const medicoId = enteroPositivo(req.body?.medicoId, 'Médico');
  const fechaIngreso = fecha(req.body?.fechaIngreso, 'Fecha de ingreso');
  const diagnostico = texto(req.body?.diagnosticoIngreso, { min: 5, max: 240, campo: 'Diagnóstico de ingreso' });
  const observaciones = opcional(req.body?.observaciones, 400);
  const validaciones = [pacienteId, habitacionId, medicoId, fechaIngreso, diagnostico, observaciones];
  const falla = validaciones.find((item) => item.error);
  if (falla) return res.status(400).json({ message: falla.error });

  if (!db.prepare('SELECT id_paciente FROM pacientes WHERE id_paciente = ?').get(pacienteId.valor)) {
    return res.status(404).json({ message: 'Paciente no encontrado' });
  }
  if (!db.prepare('SELECT id_medico FROM medicos WHERE id_medico = ?').get(medicoId.valor)) {
    return res.status(404).json({ message: 'Médico no encontrado' });
  }
  const yaActiva = db.prepare(
    `SELECT codigo FROM hospitalizaciones WHERE id_paciente = ? AND estado = 'ACTIVA'`
  ).get(pacienteId.valor);
  if (yaActiva) {
    return res.status(409).json({ message: `El paciente ya tiene la hospitalización ${yaActiva.codigo} activa` });
  }

  try {
    const creada = transaccion(() => {
      const libre = habitacionLibre(habitacionId.valor);
      if (libre.error) {
        const error = new Error(libre.error);
        error.status = 409;
        throw error;
      }
      const codigo = siguienteCodigo();
      const resultado = db.prepare(
        `INSERT INTO hospitalizaciones (
          codigo, id_paciente, id_habitacion, id_medico, fecha_ingreso,
          diagnostico_ingreso, estado, observaciones, id_usuario_registro
        ) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVA', ?, ?)`
      ).run(
        codigo, pacienteId.valor, habitacionId.valor, medicoId.valor,
        fechaIngreso.valor, diagnostico.valor, observaciones.valor, req.usuario.id
      );
      db.prepare(`UPDATE habitaciones SET estado = 'OCUPADA' WHERE id_habitacion = ?`).run(habitacionId.valor);
      return Number(resultado.lastInsertRowid);
    });
    return res.status(201).json(obtener(creada));
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.status ? error.message : 'No se pudo registrar el ingreso' });
  }
});

router.put('/:id', permitir('ADMIN', 'MEDICO'), (req, res) => {
  const id = idParam(req.params.id);
  if (!id) return res.status(400).json({ message: 'Identificador inválido' });
  const actual = db.prepare('SELECT * FROM hospitalizaciones WHERE id_hospitalizacion = ?').get(id);
  if (!actual) return res.status(404).json({ message: 'Hospitalización no encontrada' });

  const diagnostico = texto(req.body?.diagnosticoIngreso, { min: 5, max: 240, campo: 'Diagnóstico de ingreso' });
  const observaciones = opcional(req.body?.observaciones, 400);
  const medicoId = enteroPositivo(req.body?.medicoId, 'Médico');
  const falla = [diagnostico, observaciones, medicoId].find((item) => item.error);
  if (falla) return res.status(400).json({ message: falla.error });
  if (!db.prepare('SELECT id_medico FROM medicos WHERE id_medico = ?').get(medicoId.valor)) {
    return res.status(404).json({ message: 'Médico no encontrado' });
  }

  let habitacionId = actual.id_habitacion;
  if (actual.estado === 'ACTIVA' && req.body?.habitacionId) {
    const nueva = enteroPositivo(req.body.habitacionId, 'Habitación');
    if (nueva.error) return res.status(400).json({ message: nueva.error });
    habitacionId = nueva.valor;
  }

  try {
    transaccion(() => {
      if (habitacionId !== actual.id_habitacion) {
        if (actual.estado !== 'ACTIVA') {
          const error = new Error('No se puede cambiar la habitación de una hospitalización con alta');
          error.status = 409;
          throw error;
        }
        const libre = habitacionLibre(habitacionId, id);
        if (libre.error) {
          const error = new Error(libre.error);
          error.status = 409;
          throw error;
        }
        db.prepare(`UPDATE habitaciones SET estado = 'DISPONIBLE' WHERE id_habitacion = ?`).run(actual.id_habitacion);
        db.prepare(`UPDATE habitaciones SET estado = 'OCUPADA' WHERE id_habitacion = ?`).run(habitacionId);
      }
      db.prepare(
        `UPDATE hospitalizaciones
         SET diagnostico_ingreso = ?, observaciones = ?, id_medico = ?, id_habitacion = ?
         WHERE id_hospitalizacion = ?`
      ).run(diagnostico.valor, observaciones.valor, medicoId.valor, habitacionId, id);
    });
    return res.json(obtener(id));
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.status ? error.message : 'No se pudo actualizar la hospitalización' });
  }
});

router.post('/:id/alta', permitir('ADMIN', 'MEDICO'), (req, res) => {
  const id = idParam(req.params.id);
  if (!id) return res.status(400).json({ message: 'Identificador inválido' });
  const actual = db.prepare('SELECT * FROM hospitalizaciones WHERE id_hospitalizacion = ?').get(id);
  if (!actual) return res.status(404).json({ message: 'Hospitalización no encontrada' });
  if (actual.estado !== 'ACTIVA') return res.status(409).json({ message: 'Esta hospitalización ya tiene alta' });

  const fechaAlta = fecha(req.body?.fechaAlta, 'Fecha de alta');
  const diagnosticoAlta = texto(req.body?.diagnosticoAlta, { min: 5, max: 240, campo: 'Diagnóstico de alta' });
  const motivo = String(req.body?.motivoAlta ?? '');
  const falla = [fechaAlta, diagnosticoAlta].find((item) => item.error);
  if (falla) return res.status(400).json({ message: falla.error });
  if (!MOTIVOS_ALTA.includes(motivo)) return res.status(400).json({ message: 'Seleccione el motivo del alta' });
  if (fechaAlta.valor < actual.fecha_ingreso) {
    return res.status(400).json({ message: 'La fecha de alta no puede ser anterior al ingreso' });
  }

  try {
    transaccion(() => {
      db.prepare(
        `UPDATE hospitalizaciones
         SET estado = 'ALTA', fecha_alta = ?, diagnostico_alta = ?, motivo_alta = ?
         WHERE id_hospitalizacion = ?`
      ).run(fechaAlta.valor, diagnosticoAlta.valor, motivo, id);
      db.prepare(`UPDATE habitaciones SET estado = 'DISPONIBLE' WHERE id_habitacion = ?`).run(actual.id_habitacion);
    });
    return res.json(obtener(id));
  } catch {
    return res.status(500).json({ message: 'No se pudo registrar el alta' });
  }
});

router.delete('/:id', permitir('ADMIN'), (req, res) => {
  const id = idParam(req.params.id);
  if (!id) return res.status(400).json({ message: 'Identificador inválido' });
  const actual = db.prepare('SELECT * FROM hospitalizaciones WHERE id_hospitalizacion = ?').get(id);
  if (!actual) return res.status(404).json({ message: 'Hospitalización no encontrada' });
  transaccion(() => {
    if (actual.estado === 'ACTIVA') {
      db.prepare(`UPDATE habitaciones SET estado = 'DISPONIBLE' WHERE id_habitacion = ?`).run(actual.id_habitacion);
    }
    db.prepare('DELETE FROM hospitalizaciones WHERE id_hospitalizacion = ?').run(id);
  });
  return res.status(204).send();
});

module.exports = router;
