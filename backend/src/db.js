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
  const roles = db.prepare('SELECT COUNT(*) AS total FROM roles').get();
  if (roles.total === 0) {
    seed();
  }
}

function seed() {
  const clave = (texto) => bcrypt.hashSync(texto, 10);
  db.exec('BEGIN');
  try {
    const rol = db.prepare('INSERT INTO roles (nombre, descripcion) VALUES (?, ?)');
    rol.run('ADMIN', 'Administra usuarios, catálogos y toda la operación de hospitalización');
    rol.run('MEDICO', 'Consulta pacientes y habitaciones, actualiza la evolución y registra el alta');
    rol.run('RECEPCION', 'Registra pacientes y abre el ingreso a hospitalización');

    const usuario = db.prepare(
      `INSERT INTO usuarios (nombres, apellidos, correo, password_hash, id_rol)
       VALUES (?, ?, ?, ?, ?)`
    );
    usuario.run('Andrea', 'Molina', 'admin@hospital.local', clave('Admin123'), 1);
    usuario.run('Ana', 'Torres', 'medico@hospital.local', clave('Medico123'), 2);
    usuario.run('Carlos', 'Benítez', 'recepcion@hospital.local', clave('Recepcion123'), 3);

    const paciente = db.prepare(
      `INSERT INTO pacientes (
        cedula, nombres, apellidos, fecha_nacimiento, sexo, telefono, direccion,
        tipo_sangre, alergias, contacto_emergencia, telefono_emergencia
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    paciente.run('1712345675', 'Camila', 'Andrade', '1998-04-12', 'F', '0981112233', 'Av. 10 de Agosto y Colón, Quito', 'O+', 'Penicilina', 'Luis Andrade', '0992223344');
    paciente.run('0901234567', 'José', 'Mendoza', '1976-11-03', 'M', '0987654321', 'Cdla. Alborada, Guayaquil', 'A+', '', 'Marta Mendoza', '0987001122');
    paciente.run('1109876548', 'Lucía', 'Paredes', '2018-06-21', 'F', '0991234567', 'Calle Larga 8-45, Cuenca', 'B+', 'Polen', 'Rosa Paredes', '0998887766');
    paciente.run('1723456784', 'Pedro', 'Salazar', '1985-01-30', 'M', '0983344556', 'La Pradera, Quito', 'O-', '', 'Elena Salazar', '0981122003');
    paciente.run('0911223345', 'Elena', 'Ruiz', '2001-09-14', 'F', '0995566778', 'Urdesa central, Guayaquil', 'AB+', 'Ibuprofeno', 'Jorge Ruiz', '0984411220');
    paciente.run('1755667787', 'Mateo', 'Vega', '2015-02-02', 'M', '0989900112', 'Tumbaco, Quito', 'A-', '', 'Diana Vega', '0993002211');

    const medico = db.prepare(
      `INSERT INTO medicos (cedula, nombres, apellidos, especialidad, telefono, correo, id_usuario)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    medico.run('1700001116', 'Ana', 'Torres', 'Medicina interna', '0991002001', 'ana.torres@hospital.local', 2);
    medico.run('0911112225', 'Luis', 'Cedeño', 'Cirugía general', '0982003002', 'luis.cedeno@hospital.local', null);
    medico.run('0102223336', 'María', 'Vélez', 'Pediatría', '0993004003', 'maria.velez@hospital.local', null);

    const habitacion = db.prepare(
      `INSERT INTO habitaciones (numero, piso, tipo, estado, descripcion)
       VALUES (?, ?, ?, ?, ?)`
    );
    habitacion.run('101', 1, 'GENERAL', 'DISPONIBLE', 'Habitación individual con baño');
    habitacion.run('102', 1, 'GENERAL', 'OCUPADA', 'Habitación doble, cama ventana');
    habitacion.run('103', 1, 'PEDIATRIA', 'DISPONIBLE', 'Cuna y cama de acompañante');
    habitacion.run('104', 1, 'GENERAL', 'DISPONIBLE', 'Habitación individual');
    habitacion.run('201', 2, 'UCI', 'OCUPADA', 'Monitorización continua');
    habitacion.run('202', 2, 'GENERAL', 'MANTENIMIENTO', 'Cambio de cama y pintura');
    habitacion.run('203', 2, 'AISLAMIENTO', 'DISPONIBLE', 'Presión negativa');
    habitacion.run('301', 3, 'GENERAL', 'DISPONIBLE', 'Habitación doble');

    const hosp = db.prepare(
      `INSERT INTO hospitalizaciones (
        codigo, id_paciente, id_habitacion, id_medico, fecha_ingreso, fecha_alta,
        diagnostico_ingreso, diagnostico_alta, motivo_alta, estado, observaciones, id_usuario_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    hosp.run('HSP-0001', 1, 2, 1, '2026-10-14', null, 'Neumonía adquirida en la comunidad', '', '', 'ACTIVA', 'Oxígeno por cánula nasal y control de saturación.', 3);
    hosp.run('HSP-0002', 2, 5, 2, '2026-10-15', null, 'Postoperatorio de apendicectomía', '', '', 'ACTIVA', 'Vigilar dolor y diuresis. Dieta líquida.', 3);
    hosp.run('HSP-0003', 3, 3, 3, '2026-10-02', '2026-10-07', 'Gastroenteritis aguda', 'Tolerancia oral completa y afebril', 'MEJORIA', 'ALTA', 'Hidratación endovenosa durante 48 horas.', 3);
    hosp.run('HSP-0004', 4, 1, 1, '2026-09-20', '2026-09-28', 'Crisis hipertensiva', 'Presión arterial controlada', 'MEJORIA', 'ALTA', 'Ajuste de antihipertensivo.', 3);

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
