-- ==========================================
-- EXAMEN: SISTEMA DE GESTIÓN ODONTOLÓGICA
-- ESTUDIANTE: KEVIN ANDRÉS CRESPO GUILLÉN
-- BASE DE DATOS: odontologia_db
-- ==========================================

-- 1. USUARIOS: acceso y seguridad
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'USER',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_rol CHECK (rol IN ('ADMIN', 'USER'))
);

-- 2. PACIENTES: información personal
CREATE TABLE pacientes (
    id BIGSERIAL PRIMARY KEY,
    cedula VARCHAR(10) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(100),
    direccion VARCHAR(200),
    usuario_id BIGINT UNIQUE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- 3. ODONTÓLOGOS: profesionales
CREATE TABLE odontologos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100),
    telefono VARCHAR(20),
    correo VARCHAR(100)
);

-- 4. SERVICIOS: tratamientos
CREATE TABLE servicios (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    precio NUMERIC(10,2) NOT NULL,
    CONSTRAINT chk_precio CHECK (precio >= 0)
);

-- 5. CITAS: reservas odontológicas
CREATE TABLE citas (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL,
    odontologo_id BIGINT NOT NULL,
    servicio_id BIGINT NOT NULL,
    fecha_hora TIMESTAMP NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    observaciones VARCHAR(255),

    FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    FOREIGN KEY (odontologo_id) REFERENCES odontologos(id),
    FOREIGN KEY (servicio_id) REFERENCES servicios(id),

    CONSTRAINT chk_estado_cita CHECK (
        estado IN (
            'PENDIENTE',
            'CONFIRMADA',
            'ATENDIDA',
            'CANCELADA'
        )
    )
);

-- Evita dos citas no canceladas con el mismo
-- odontólogo a la misma hora de inicio
CREATE UNIQUE INDEX uq_cita_odontologo_fecha
ON citas (odontologo_id, fecha_hora)
WHERE estado <> 'CANCELADA';

-- 6. PAGOS: pagos realizados por citas
CREATE TABLE pagos (
    id BIGSERIAL PRIMARY KEY,
    cita_id BIGINT NOT NULL UNIQUE,
    monto NUMERIC(10,2) NOT NULL,
    metodo_pago VARCHAR(30),
    fecha_pago TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',

    FOREIGN KEY (cita_id) REFERENCES citas(id),

    CONSTRAINT chk_monto CHECK (monto >= 0),
    CONSTRAINT chk_estado_pago CHECK (
        estado IN ('PENDIENTE', 'PAGADO', 'CANCELADO')
    )
);