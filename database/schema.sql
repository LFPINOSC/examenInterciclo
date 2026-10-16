-- Control de órdenes de trabajo - Esquema de base de datos (SQLite)
PRAGMA foreign_keys = ON;

-- Usuarios del sistema: admin o técnico (control de acceso por rol)
CREATE TABLE IF NOT EXISTS usuarios (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre        TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  rol           TEXT NOT NULL CHECK (rol IN ('admin','tecnico')),
  activo        INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0,1)),
  creado_en     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Clientes que solicitan trabajos
CREATE TABLE IF NOT EXISTS clientes (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre    TEXT NOT NULL,
  cedula    TEXT NOT NULL UNIQUE,
  telefono  TEXT,
  email     TEXT,
  direccion TEXT,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Equipos/bienes de un cliente sobre los que se trabaja (1 cliente : N equipos)
CREATE TABLE IF NOT EXISTS equipos (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  tipo       TEXT NOT NULL,
  marca      TEXT,
  modelo     TEXT,
  serie      TEXT UNIQUE,
  creado_en  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Orden de trabajo: cliente + equipo + técnico asignado
CREATE TABLE IF NOT EXISTS ordenes_trabajo (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo        TEXT NOT NULL UNIQUE,
  cliente_id    INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  equipo_id     INTEGER NOT NULL REFERENCES equipos(id)  ON DELETE RESTRICT,
  tecnico_id    INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  descripcion   TEXT NOT NULL,
  prioridad     TEXT NOT NULL DEFAULT 'media' CHECK (prioridad IN ('baja','media','alta')),
  estado        TEXT NOT NULL DEFAULT 'pendiente'
                CHECK (estado IN ('pendiente','en_proceso','completada','cancelada')),
  fecha_ingreso TEXT NOT NULL DEFAULT (date('now')),
  fecha_entrega TEXT,
  creado_por    INTEGER NOT NULL REFERENCES usuarios(id)
);

-- Tareas realizadas dentro de una orden (1 orden : N tareas)
CREATE TABLE IF NOT EXISTS tareas (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  orden_id    INTEGER NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  horas       REAL NOT NULL DEFAULT 0 CHECK (horas >= 0),
  costo       REAL NOT NULL DEFAULT 0 CHECK (costo >= 0),
  completada  INTEGER NOT NULL DEFAULT 0 CHECK (completada IN (0,1))
);

CREATE INDEX IF NOT EXISTS idx_ordenes_estado  ON ordenes_trabajo(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_tecnico ON ordenes_trabajo(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_equipos_cliente ON equipos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_tareas_orden    ON tareas(orden_id);
