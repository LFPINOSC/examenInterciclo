const express = require('express');
const { db } = require('../db');
const { autenticar, permitir } = require('../middleware');
const { texto, cedula, telefono, idParam, errorUnico } = require('../validators');

const router = express.Router();
router.use(autenticar);

function mapear(fila) {
  return {
    id: fila.id_paciente,
    cedula: fila.cedula,
    nombres: fila.nombres,
    apellidos: fila.apellidos,
    telefono: fila.telefono,
    direccion: fila.direccion,
  };
}

function leerCuerpo(body) {
  const campos = {
    cedula: cedula(body.cedula),
    nombres: texto(body.nombres, { min: 2, max: 80, campo: 'Nombres' }),
    apellidos: texto(body.apellidos, { min: 2, max: 80, campo: 'Apellidos' }),
    telefono: telefono(body.telefono),
    direccion: texto(body.direccion, { min: 4, max: 180, campo: 'Dirección' }),
  };
  for (const campo of Object.values(campos)) {
    if (campo.error) return { error: campo.error };
  }
  return {
    valor: {
      cedula: campos.cedula.valor,
      nombres: campos.nombres.valor,
      apellidos: campos.apellidos.valor,
      telefono: campos.telefono.valor,
      direccion: campos.direccion.valor,
    },
  };
}

router.get('/', (req, res) => {
  const q = String(req.query.q ?? '').trim().replace(/[%_]/g, '');
  const params = [];
  let filtro = '';
  if (q) {
    filtro = `WHERE cedula LIKE ? OR nombres LIKE ? OR apellidos LIKE ? OR (nombres || ' ' || apellidos) LIKE ?`;
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }
  return res.json(
    db.prepare(`SELECT * FROM pacientes ${filtro} ORDER BY apellidos, nombres`).all(...params).map(mapear)
  );
});

router.post('/', permitir('ADMIN', 'RECEPCION'), (req, res) => {
  const cuerpo = leerCuerpo(req.body ?? {});
  if (cuerpo.error) return res.status(400).json({ message: cuerpo.error });
  const d = cuerpo.valor;
  try {
    const r = db.prepare(
      `INSERT INTO pacientes (cedula, nombres, apellidos, telefono, direccion) VALUES (?, ?, ?, ?, ?)`
    ).run(d.cedula, d.nombres, d.apellidos, d.telefono, d.direccion);
    return res.status(201).json(mapear(db.prepare('SELECT * FROM pacientes WHERE id_paciente = ?').get(Number(r.lastInsertRowid))));
  } catch (error) {
    const mensaje = errorUnico(error, [['pacientes.cedula', 'Ya existe esa cédula']]);
    return res.status(mensaje ? 409 : 500).json({ message: mensaje || 'No se pudo guardar' });
  }
});

router.put('/:id', permitir('ADMIN', 'RECEPCION'), (req, res) => {
  const id = idParam(req.params.id);
  if (!id || !db.prepare('SELECT id_paciente FROM pacientes WHERE id_paciente = ?').get(id)) {
    return res.status(404).json({ message: 'Paciente no encontrado' });
  }
  const cuerpo = leerCuerpo(req.body ?? {});
  if (cuerpo.error) return res.status(400).json({ message: cuerpo.error });
  const d = cuerpo.valor;
  try {
    db.prepare(
      `UPDATE pacientes SET cedula = ?, nombres = ?, apellidos = ?, telefono = ?, direccion = ? WHERE id_paciente = ?`
    ).run(d.cedula, d.nombres, d.apellidos, d.telefono, d.direccion, id);
    return res.json(mapear(db.prepare('SELECT * FROM pacientes WHERE id_paciente = ?').get(id)));
  } catch (error) {
    const mensaje = errorUnico(error, [['pacientes.cedula', 'Ya existe esa cédula']]);
    return res.status(mensaje ? 409 : 500).json({ message: mensaje || 'No se pudo actualizar' });
  }
});

router.delete('/:id', permitir('ADMIN'), (req, res) => {
  const id = idParam(req.params.id);
  if (!id) return res.status(400).json({ message: 'Id inválido' });
  const historial = db.prepare('SELECT COUNT(*) AS n FROM hospitalizaciones WHERE id_paciente = ?').get(id);
  if (historial.n > 0) {
    return res.status(409).json({ message: 'Tiene hospitalizaciones registradas' });
  }
  db.prepare('DELETE FROM pacientes WHERE id_paciente = ?').run(id);
  return res.status(204).send();
});

module.exports = router;
