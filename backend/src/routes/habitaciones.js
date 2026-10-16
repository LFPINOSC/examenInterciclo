const express = require('express');
const { db } = require('../db');
const { autenticar, permitir } = require('../middleware');
const {
  texto, opcional, idParam, errorUnico, enteroPositivo, TIPOS_HABITACION, ESTADOS_HABITACION,
} = require('../validators');

const router = express.Router();
router.use(autenticar);

function mapear(fila) {
  return {
    id: fila.id_habitacion,
    numero: fila.numero,
    piso: fila.piso,
    tipo: fila.tipo,
    estado: fila.estado,
    descripcion: fila.descripcion,
    pacienteNombre: fila.paciente_nombre || null,
    hospitalizacionCodigo: fila.hospitalizacion_codigo || null,
  };
}

const consulta = `
  SELECT hab.*,
    p.nombres || ' ' || p.apellidos AS paciente_nombre,
    h.codigo AS hospitalizacion_codigo
  FROM habitaciones hab
  LEFT JOIN hospitalizaciones h ON h.id_habitacion = hab.id_habitacion AND h.estado = 'ACTIVA'
  LEFT JOIN pacientes p ON p.id_paciente = h.id_paciente
`;

function hospitalizacionActiva(idHabitacion) {
  return db.prepare(
    `SELECT id_hospitalizacion FROM hospitalizaciones WHERE id_habitacion = ? AND estado = 'ACTIVA'`
  ).get(idHabitacion);
}

function leerCuerpo(body) {
  const numero = texto(body.numero, { min: 1, max: 10, campo: 'Número' });
  if (numero.error) return { error: numero.error };
  const piso = enteroPositivo(body.piso, 'Piso');
  if (piso.error) return { error: piso.error };
  const tipo = String(body.tipo ?? '');
  if (!TIPOS_HABITACION.includes(tipo)) return { error: 'Tipo de habitación inválido' };
  const estado = String(body.estado ?? '');
  if (!ESTADOS_HABITACION.includes(estado)) return { error: 'Estado de habitación inválido' };
  const descripcion = opcional(body.descripcion, 180);
  if (descripcion.error) return { error: descripcion.error };
  return { valor: { numero: numero.valor, piso: piso.valor, tipo, estado, descripcion: descripcion.valor } };
}

router.get('/', (req, res) => {
  const estado = String(req.query.estado ?? '');
  const q = String(req.query.q ?? '').trim().replace(/[%_]/g, '');
  const params = [];
  const filtros = [];
  if (estado) {
    if (!ESTADOS_HABITACION.includes(estado)) return res.status(400).json({ message: 'Estado inválido' });
    filtros.push('hab.estado = ?');
    params.push(estado);
  }
  if (q) {
    filtros.push('(hab.numero LIKE ? OR hab.tipo LIKE ? OR hab.descripcion LIKE ?)');
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
  return res.json(db.prepare(`${consulta} ${where} ORDER BY hab.piso, hab.numero`).all(...params).map(mapear));
});

router.get('/:id', (req, res) => {
  const id = idParam(req.params.id);
  if (!id) return res.status(400).json({ message: 'Identificador inválido' });
  const fila = db.prepare(`${consulta} WHERE hab.id_habitacion = ?`).get(id);
  if (!fila) return res.status(404).json({ message: 'Habitación no encontrada' });
  return res.json(mapear(fila));
});

router.post('/', permitir('ADMIN'), (req, res) => {
  const cuerpo = leerCuerpo(req.body ?? {});
  if (cuerpo.error) return res.status(400).json({ message: cuerpo.error });
  if (cuerpo.valor.estado === 'OCUPADA') {
    return res.status(400).json({ message: 'Una habitación nueva no puede nacer ocupada. Registre una hospitalización.' });
  }
  try {
    const resultado = db.prepare(
      `INSERT INTO habitaciones (numero, piso, tipo, estado, descripcion) VALUES (?, ?, ?, ?, ?)`
    ).run(cuerpo.valor.numero, cuerpo.valor.piso, cuerpo.valor.tipo, cuerpo.valor.estado, cuerpo.valor.descripcion);
    return res.status(201).json(mapear(db.prepare(`${consulta} WHERE hab.id_habitacion = ?`).get(Number(resultado.lastInsertRowid))));
  } catch (error) {
    const mensaje = errorUnico(error, [['habitaciones.numero', 'Ya existe una habitación con ese número']]);
    return res.status(mensaje ? 409 : 500).json({ message: mensaje || 'No se pudo registrar la habitación' });
  }
});

router.put('/:id', permitir('ADMIN'), (req, res) => {
  const id = idParam(req.params.id);
  if (!id) return res.status(400).json({ message: 'Identificador inválido' });
  if (!db.prepare('SELECT id_habitacion FROM habitaciones WHERE id_habitacion = ?').get(id)) {
    return res.status(404).json({ message: 'Habitación no encontrada' });
  }
  const cuerpo = leerCuerpo(req.body ?? {});
  if (cuerpo.error) return res.status(400).json({ message: cuerpo.error });
  const activa = hospitalizacionActiva(id);
  if (activa && cuerpo.valor.estado !== 'OCUPADA') {
    return res.status(409).json({ message: 'Hay una hospitalización activa. El estado solo cambia al dar el alta.' });
  }
  if (!activa && cuerpo.valor.estado === 'OCUPADA') {
    return res.status(409).json({ message: 'No puede marcarla ocupada sin una hospitalización activa' });
  }
  try {
    db.prepare(
      `UPDATE habitaciones SET numero = ?, piso = ?, tipo = ?, estado = ?, descripcion = ? WHERE id_habitacion = ?`
    ).run(cuerpo.valor.numero, cuerpo.valor.piso, cuerpo.valor.tipo, cuerpo.valor.estado, cuerpo.valor.descripcion, id);
    return res.json(mapear(db.prepare(`${consulta} WHERE hab.id_habitacion = ?`).get(id)));
  } catch (error) {
    const mensaje = errorUnico(error, [['habitaciones.numero', 'Ya existe una habitación con ese número']]);
    return res.status(mensaje ? 409 : 500).json({ message: mensaje || 'No se pudo actualizar la habitación' });
  }
});

router.delete('/:id', permitir('ADMIN'), (req, res) => {
  const id = idParam(req.params.id);
  if (!id) return res.status(400).json({ message: 'Identificador inválido' });
  if (!db.prepare('SELECT id_habitacion FROM habitaciones WHERE id_habitacion = ?').get(id)) {
    return res.status(404).json({ message: 'Habitación no encontrada' });
  }
  const historial = db.prepare('SELECT COUNT(*) AS total FROM hospitalizaciones WHERE id_habitacion = ?').get(id);
  if (historial.total > 0) {
    return res.status(409).json({ message: 'No se puede eliminar: la habitación tiene historial de hospitalización. Pásela a mantenimiento.' });
  }
  db.prepare('DELETE FROM habitaciones WHERE id_habitacion = ?').run(id);
  return res.status(204).send();
});

module.exports = router;
