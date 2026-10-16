-- TECNOSOPORTE | Estudiante 21
-- Ejecutar conectado a la base de datos: soporte_tecnico_db
-- Modelo: 6 tablas; roles ADMIN y CLIENTE.
-- Los técnicos NO tienen cuenta de inicio de sesión.
-- Las contraseñas se guardan solo como hashes BCrypt desde Spring Boot.

BEGIN;

-- 1. Usuarios que pueden iniciar sesión (ADMIN o CLIENTE).
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL CHECK (BTRIM(nombre) <> ''),
    apellido VARCHAR(80) NOT NULL CHECK (BTRIM(apellido) <> ''),
    correo VARCHAR(150) NOT NULL CHECK (BTRIM(correo) <> ''),
    telefono VARCHAR(10),
    contrasena_hash VARCHAR(255) NOT NULL CHECK (BTRIM(contrasena_hash) <> ''),
    rol VARCHAR(10) NOT NULL DEFAULT 'CLIENTE'
        CHECK (rol IN ('ADMIN', 'CLIENTE')),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_usuario_telefono CHECK (
        telefono IS NULL OR telefono ~ '^09[0-9]{8}$'
    )
);

-- Evita correos duplicados incluso con diferentes mayúsculas/minúsculas.
CREATE UNIQUE INDEX IF NOT EXISTS uq_usuarios_correo_ci
    ON usuarios (LOWER(BTRIM(correo)));

-- 2. Técnicos registrados y asignados por ADMIN, sin credenciales.
CREATE TABLE IF NOT EXISTS tecnicos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL CHECK (BTRIM(nombre) <> ''),
    apellido VARCHAR(80) NOT NULL CHECK (BTRIM(apellido) <> ''),
    especialidad VARCHAR(120) NOT NULL CHECK (BTRIM(especialidad) <> ''),
    telefono VARCHAR(10),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_tecnico_telefono CHECK (
        telefono IS NULL OR telefono ~ '^09[0-9]{8}$'
    )
);

-- 3. Cada equipo pertenece a un cliente.
CREATE TABLE IF NOT EXISTS equipos (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    tipo VARCHAR(25) NOT NULL
        CHECK (tipo IN ('LAPTOP', 'PC_ESCRITORIO', 'IMPRESORA', 'OTRO')),
    marca VARCHAR(80) NOT NULL CHECK (BTRIM(marca) <> ''),
    modelo VARCHAR(100) NOT NULL CHECK (BTRIM(modelo) <> ''),
    numero_serie VARCHAR(100),
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_equipo_serie CHECK (
        numero_serie IS NULL OR BTRIM(numero_serie) <> ''
    )
);

CREATE INDEX IF NOT EXISTS idx_equipos_cliente ON equipos(cliente_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_equipos_serie_ci
    ON equipos (UPPER(BTRIM(numero_serie)))
    WHERE numero_serie IS NOT NULL;

-- 4. Catálogo de servicios prestados por el centro de soporte.
CREATE TABLE IF NOT EXISTS servicios (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL CHECK (BTRIM(nombre) <> ''),
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_servicios_nombre_ci
    ON servicios (LOWER(BTRIM(nombre)));

-- 5. Solicitudes: cada ticket pertenece a un equipo y
-- opcionalmente se asigna a un técnico.
-- El cliente del ticket se determina por equipos.cliente_id.
CREATE TABLE IF NOT EXISTS tickets (
    id BIGSERIAL PRIMARY KEY,
    equipo_id BIGINT NOT NULL REFERENCES equipos(id) ON DELETE RESTRICT,
    tecnico_id BIGINT REFERENCES tecnicos(id) ON DELETE RESTRICT,
    descripcion_problema TEXT NOT NULL
        CHECK (BTRIM(descripcion_problema) <> ''),
    diagnostico TEXT,
    solucion TEXT,
    prioridad VARCHAR(10) NOT NULL DEFAULT 'MEDIA'
        CHECK (prioridad IN ('BAJA', 'MEDIA', 'ALTA', 'URGENTE')),
    estado VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE'
        CHECK (estado IN ('PENDIENTE', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO')),
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_cierre TIMESTAMPTZ,
    CONSTRAINT ck_ticket_fecha_cierre CHECK (
        fecha_cierre IS NULL OR fecha_cierre >= fecha_creacion
    )
);

CREATE INDEX IF NOT EXISTS idx_tickets_equipo ON tickets(equipo_id);
CREATE INDEX IF NOT EXISTS idx_tickets_tecnico ON tickets(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_tickets_estado ON tickets(estado);

-- 6. Relación muchos-a-muchos TICKET <-> SERVICIO.
-- Se congela el precio aplicado para conservar el historial,
-- aunque el precio del catálogo cambie posteriormente.
CREATE TABLE IF NOT EXISTS detalles_servicio (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE RESTRICT,
    servicio_id BIGINT NOT NULL REFERENCES servicios(id) ON DELETE RESTRICT,
    precio_aplicado NUMERIC(10,2) NOT NULL CHECK (precio_aplicado >= 0),
    observacion TEXT,
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_ticket_servicio UNIQUE(ticket_id, servicio_id)
);

CREATE INDEX IF NOT EXISTS idx_detalles_ticket ON detalles_servicio(ticket_id);

COMMIT;

-- CONSULTA DE VERIFICACIÓN (debe mostrar 6 tablas):
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN (
      'usuarios', 'tecnicos', 'equipos', 'servicios', 'tickets', 'detalles_servicio'
  )
ORDER BY table_name;
