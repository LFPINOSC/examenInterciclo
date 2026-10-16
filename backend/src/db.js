const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { DatabaseSync } = require('node:sqlite');

const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, 'hospital.db'));
db.exec('PRAGMA foreign_keys = ON');

function init() {
  const schema = fs.readFileSync(path.join(__dirname, '..', '..', 'database', 'schema.sql'), 'utf8');
  db.exec(schema);
  const total = db.prepare('SELECT COUNT(*) AS n FROM usuarios').get();
  if (total.n === 0) seed();
}

function seed() {
  const clave = (texto) => bcrypt.hashSync(texto, 10);
  db.exec('BEGIN');
  try {
    const usuario = db.prepare(
      `INSERT INTO usuarios (nombres, apellidos, correo, password_hash, rol) VALUES (?, ?, ?, ?, ?)`
    );
    usuario.run('Andrea', 'Molina', 'admin@hospital.local', clave('Admin123'), 'ADMIN');
    usuario.run('Ana', 'Torres', 'medico@hospital.local', clave('Medico123'), 'MEDICO');
    usuario.run('Carlos', 'Benítez', 'recepcion@hospital.local', clave('Recepcion123'), 'RECEPCION');

    const paciente = db.prepare(
      `INSERT INTO pacientes (cedula, nombres, apellidos, telefono, direccion) VALUES (?, ?, ?, ?, ?)`
    );
    paciente.run('1712345675', 'Camila', 'Andrade', '0981112233', 'Quito');
    paciente.run('0901234567', 'José', 'Mendoza', '0987654321', 'Guayaquil');
    paciente.run('1109876548', 'Lucía', 'Paredes', '0991234567', 'Cuenca');
    paciente.run('1723456784', 'Pedro', 'Salazar', '0983344556', 'Quito');

    const habitacion = db.prepare(
      `INSERT INTO habitaciones (numero, piso, tipo, estado, descripcion) VALUES (?, ?, ?, ?, ?)`
    );
    habitacion.run('101', 1, 'GENERAL', 'DISPONIBLE', 'Individual');
    habitacion.run('102', 1, 'GENERAL', 'OCUPADA', 'Doble');
    habitacion.run('103', 1, 'PEDIATRIA', 'DISPONIBLE', 'Pediatría');
    habitacion.run('201', 2, 'UCI', 'OCUPADA', 'UCI');
    habitacion.run('202', 2, 'GENERAL', 'MANTENIMIENTO', 'Mantenimiento');

    const hosp = db.prepare(
      `INSERT INTO hospitalizaciones (
        codigo, id_paciente, id_habitacion, medico_responsable, fecha_ingreso,
        diagnostico_ingreso, estado, observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVA', ?)`
    );
    hosp.run('HSP-0001', 1, 2, 'Ana Torres', '2026-10-14', 'Neumonía', 'Control de saturación');
    hosp.run('HSP-0002', 2, 4, 'Luis Cedeño', '2026-10-15', 'Postoperatorio', 'Dieta líquida');

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function transaccion(trabajo) {
  db.exec('BEGIN');
  try {
    const resultado = trabajo();
    db.exec('COMMIT');
    return resultado;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

module.exports = { db, init, transaccion };
