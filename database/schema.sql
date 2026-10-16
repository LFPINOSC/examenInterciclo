-- Control de hospitalización
-- Cada hospitalización es un ingreso distinto: un paciente puede tener varias a lo largo del tiempo
-- y una habitación vuelve a quedar libre cuando se registra el alta.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS roles (
  id_rol INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  correo TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  id_rol INTEGER NOT NULL,
  activo INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1)),
  creado_en TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (id_rol) REFERENCES roles (id_rol)
);

CREATE TABLE IF NOT EXISTS pacientes (
  id_paciente INTEGER PRIMARY KEY AUTOINCREMENT,
  cedula TEXT NOT NULL UNIQUE,
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  fecha_nacimiento TEXT NOT NULL,
  sexo TEXT NOT NULL CHECK (sexo IN ('M', 'F', 'O')),
  telefono TEXT NOT NULL,
  direccion TEXT NOT NULL,
  tipo_sangre TEXT NOT NULL DEFAULT '',
  alergias TEXT NOT NULL DEFAULT '',
  contacto_emergencia TEXT NOT NULL,
  telefono_emergencia TEXT NOT NULL,
  creado_en TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS medicos (
  id_medico INTEGER PRIMARY KEY AUTOINCREMENT,
  cedula TEXT NOT NULL UNIQUE,
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  especialidad TEXT NOT NULL,
  telefono TEXT NOT NULL,
  correo TEXT NOT NULL UNIQUE,
  id_usuario INTEGER UNIQUE,
  creado_en TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE SET NULL
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
  id_medico INTEGER NOT NULL,
  fecha_ingreso TEXT NOT NULL,
  fecha_alta TEXT,
  diagnostico_ingreso TEXT NOT NULL,
  diagnostico_alta TEXT NOT NULL DEFAULT '',
  motivo_alta TEXT NOT NULL DEFAULT '',
  estado TEXT NOT NULL CHECK (estado IN ('ACTIVA', 'ALTA')),
  observaciones TEXT NOT NULL DEFAULT '',
  id_usuario_registro INTEGER,
  creado_en TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (id_paciente) REFERENCES pacientes (id_paciente),
  FOREIGN KEY (id_habitacion) REFERENCES habitaciones (id_habitacion),
  FOREIGN KEY (id_medico) REFERENCES medicos (id_medico),
  FOREIGN KEY (id_usuario_registro) REFERENCES usuarios (id_usuario) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_hospitalizaciones_estado ON hospitalizaciones (estado);
CREATE INDEX IF NOT EXISTS idx_hospitalizaciones_paciente ON hospitalizaciones (id_paciente);
CREATE INDEX IF NOT EXISTS idx_hospitalizaciones_habitacion ON hospitalizaciones (id_habitacion);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios (id_rol);
