const express = require('express');
const { db } = require('../db');
const { autenticar, permitir } = require('../middleware');
const {
  texto, cedula, telefono, fecha, opcional, idParam, errorUnico, SEXOS, TIPOS_SANGRE,
} = require('../validators');

const router = express.Router();
router.use(autenticar);

function mapear(fila) {
  return {
    id: fila.id_paciente,
    cedula: fila.cedula,
    nombres: fila.nombres,
    apellidos: fila.apellidos,
    fechaNacimiento: fila.fecha_nacimiento,
    sexo: fila.sexo,
    telefono: fila.telefono,
    direccion: fila.direccion,
    tipoSangre: fila.tipo_sangre,
    alergias: fila.alergias,
    contactoEmergencia: fila.contacto_emergencia,
    telefonoEmergencia: fila.telefono_emergencia,
  };
}

function leerCuerpo(body) {
  const campos = {
    cedula: cedula(body.cedula),
    nombres: texto(body.nombres, { min: 2, max: 80, campo: 'Nombres' }),
    apellidos: texto(body.apellidos, { min: 2, max: 80, campo: 'Apellidos' }),
    fechaNacimiento: fecha(body.fechaNacimiento, 'Fecha de nacimiento'),
    telefono: telefono(body.telefono),
    direccion: texto(body.direccion, { min: 4, max: 180, campo: 'Dirección' }),
    alergias: opcional(body.alergias, 180),
    contactoEmergencia: texto(body.contactoEmergencia, { min: 2, max: 80, campo: 'Contacto de emergencia' }),
    telefonoEmergencia: telefono(body.telefonoEmergencia, 'Teléfono de emergencia'),
  };
  for (const campo of Object.values(campos)) {
    if (campo.error) return { error: campo.error };
  }
  const sexo = String(body.sexo ?? '');
  if (!SEXOS.includes(sexo)) return { error: 'Seleccione el sexo' };
  const tipoSangre = String(body.tipoSangre ?? '');
  if (!TIPOS_SANGRE.includes(tipoSangre)) return { error: 'Tipo de sangre inválido' };
  const hoy = new Date().toISOString().slice(0, 10);
  if (campos.fechaNacimiento.valor > hoy) return { error: 'La fecha de nacimiento no puede ser futura' };
  return {
    valor: {
      cedula: campos.cedula.valor,
      nombres: campos.nombres.valor,
      apellidos: campos.apellidos.valor,
      fechaNacimiento: campos.fechaNacimiento.valor,
      sexo,
      telefono: campos.telefono.valor,
      direccion: campos.direccion.valor,
      tipoSangre,
      alergias: campos.alergias.valor,
      contactoEmergencia: campos.contactoEmergencia.valor,
      telefonoEmergencia: campos.telefonoEmergencia.valor,
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
  const filas = db.prepare(
    `SELECT * FROM pacientes ${filtro} ORDER BY apellidos, nombres`
  ).all(...params);
  return res.json(filas.map(mapear));
});

router.get('/:id', (req, res) => {
  const id = idParam(req.params.id);
  if (!id) return res.status(400).json({ message: 'Identificador inválido' });
  const fila = db.prepare('SELECT * FROM pacientes WHERE id_paciente = ?').get(id);
  if (!fila) return res.status(404).json({ message: 'Paciente no encontrado' });
  return res.json(mapear(fila));
});

router.post('/', permitir('ADMIN', 'RECEPCION'), (req, res) => {
  const cuerpo = leerCuerpo(req.body ?? {});
  if (cuerpo.error) return res.status(400).json({ message: cuerpo.error });
  const datos = cuerpo.valor;
  try {
    const resultado = db.prepare(
      `INSERT INTO pacientes (
        cedula, nombres, apellidos, fecha_nacimiento, sexo, telefono, direccion,
        tipo_sangre, alergias, contacto_emergencia, telefono_emergencia
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      datos.cedula, datos.nombres, datos.apellidos, datos.fechaNacimiento, datos.sexo,
      datos.telefono, datos.direccion, datos.tipoSangre, datos.alergias,
      datos.contactoEmergencia, datos.telefonoEmergencia
    );
    const fila = db.prepare('SELECT * FROM pacientes WHERE id_paciente = ?').get(Number(resultado.lastInsertRowid));
    return res.status(201).json(mapear(fila));
  } catch (error) {
    const mensaje = errorUnico(error, [['pacientes.cedula', 'Ya existe un paciente con esa cédula']]);
    return res.status(mensaje ? 409 : 500).json({ message: mensaje || 'No se pudo registrar el paciente' });
  }
});

router.put('/:id', permitir('ADMIN', 'RECEPCION'), (req, res) => {
  const id = idParam(req.params.id);
  if (!id) return res.status(400).json({ message: 'Identificador inválido' });
  const actual = db.prepare('SELECT * FROM pacientes WHERE id_paciente = ?').get(id);
  if (!actual) return res.status(404).json({ message: 'Paciente no encontrado' });
  const cuerpo = leerCuerpo(req.body ?? {});
  if (cuerpo.error) return res.status(400).json({ message: cuerpo.error });
  const datos = cuerpo.valor;
  try {
    db.prepare(
      `UPDATE pacientes SET
        cedula = ?, nombres = ?, apellidos = ?, fecha_nacimiento = ?, sexo = ?, telefono = ?,
        direccion = ?, tipo_sangre = ?, alergias = ?, contacto_emergencia = ?, telefono_emergencia = ?
       WHERE id_paciente = ?`
    ).run(
      datos.cedula, datos.nombres, datos.apellidos, datos.fechaNacimiento, datos.sexo,
      datos.telefono, datos.direccion, datos.tipoSangre, datos.alergias,
      datos.contactoEmergencia, datos.telefonoEmergencia, id
    );
    return res.json(mapear(db.prepare('SELECT * FROM pacientes WHERE id_paciente = ?').get(id)));
  } catch (error) {
    const mensaje = errorUnico(error, [['pacientes.cedula', 'Ya existe un paciente con esa cédula']]);
    return res.status(mensaje ? 409 : 500).json({ message: mensaje || 'No se pudo actualizar el paciente' });
  }
});

router.delete('/:id', permitir('ADMIN'), (req, res) => {
  const id = idParam(req.params.id);
  if (!id) return res.status(400).json({ message: 'Identificador inválido' });
  const actual = db.prepare('SELECT id_paciente FROM pacientes WHERE id_paciente = ?').get(id);
  if (!actual) return res.status(404).json({ message: 'Paciente no encontrado' });
  const historial = db.prepare('SELECT COUNT(*) AS total FROM hospitalizaciones WHERE id_paciente = ?').get(id);
  if (historial.total > 0) {
    return res.status(409).json({ message: 'No se puede eliminar: el paciente tiene hospitalizaciones registradas' });
  }
  db.prepare('DELETE FROM pacientes WHERE id_paciente = ?').run(id);
  return res.status(204).send();
});

module.exports = router;
