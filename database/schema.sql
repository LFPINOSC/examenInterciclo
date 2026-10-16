-- 4 tablas: pacientes, habitaciones, hospitalizaciones, usuarios (login y roles)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  correo TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('ADMIN', 'MEDICO', 'RECEPCION')),
  activo INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1))
);

CREATE TABLE IF NOT EXISTS pacientes (
  id_paciente INTEGER PRIMARY KEY AUTOINCREMENT,
  cedula TEXT NOT NULL UNIQUE,
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  telefono TEXT NOT NULL,
  direccion TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS habitaciones (
  id_habitacion INTEGER PRIMARY KEY AUTOINCREMENT,
  numero TEXT NOT NULL UNIQUE,
  piso INTEGER NOT NULL CHECK (piso > 0),
  tipo TEXT NOT NULL CHECK (tipo IN ('GENERAL', 'UCI', 'PEDIATRIA', 'AISLAMIENTO')),
  estado TEXT NOT NULL CHECK (estado IN ('DISPONIBLE', 'OCUPADA', 'MANTENIMIENTO')),
  descripcion TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS hospitalizaciones (
  id_hospitalizacion INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL UNIQUE,
  id_paciente INTEGER NOT NULL,
  id_habitacion INTEGER NOT NULL,
  medico_responsable TEXT NOT NULL,
  fecha_ingreso TEXT NOT NULL,
  fecha_alta TEXT,
  diagnostico_ingreso TEXT NOT NULL,
  diagnostico_alta TEXT NOT NULL DEFAULT '',
  motivo_alta TEXT NOT NULL DEFAULT '',
  estado TEXT NOT NULL CHECK (estado IN ('ACTIVA', 'ALTA')),
  observaciones TEXT NOT NULL DEFAULT '',
  FOREIGN KEY (id_paciente) REFERENCES pacientes (id_paciente),
  FOREIGN KEY (id_habitacion) REFERENCES habitaciones (id_habitacion)
);

CREATE INDEX IF NOT EXISTS idx_hospitalizaciones_estado ON hospitalizaciones (estado);
CREATE INDEX IF NOT EXISTS idx_hospitalizaciones_paciente ON hospitalizaciones (id_paciente);
