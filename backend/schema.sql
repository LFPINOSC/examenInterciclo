-- Creación de la base de datos para el Laboratorio Clínico
-- Autor: Bruno Castillo

-- 1. Tabla de Roles (Administrador, Recepcionista, Laboratorista, Paciente)
CREATE TABLE rol (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Tabla de Usuarios del sistema (Seguridad y acceso)
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Almacenará la contraseña cifrada (bcrypt)
    id_rol INT NOT NULL,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
);

-- 3. Tabla de Pacientes
CREATE TABLE paciente (
    id_paciente SERIAL PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(200),
    fecha_nacimiento DATE
);

-- 4. Tabla de Médicos Tratantes
CREATE TABLE medico (
    id_medico SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100),
    telefono VARCHAR(20),
    correo VARCHAR(150)
);

-- 5. Catálogo de Exámenes de Laboratorio
CREATE TABLE examen (
    id_examen SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre_examen VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    valores_referencia VARCHAR(150) NOT NULL -- Ej: "70 - 100 mg/dL"
);

-- 6. Cabecera de la Orden de Laboratorio
CREATE TABLE orden_laboratorio (
    id_orden SERIAL PRIMARY KEY,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(30) DEFAULT 'Pendiente', -- Pendiente, En Proceso, Completada
    id_paciente INT NOT NULL,
    id_medico INT NOT NULL,
    CONSTRAINT fk_orden_paciente FOREIGN KEY (id_paciente) REFERENCES paciente(id_paciente),
    CONSTRAINT fk_orden_medico FOREIGN KEY (id_medico) REFERENCES medico(id_medico)
);

-- 7. Detalle de la Orden (Relación de los exámenes solicitados y sus resultados)
CREATE TABLE detalle_orden (
    id_detalle SERIAL PRIMARY KEY,
    id_orden INT NOT NULL,
    id_examen INT NOT NULL,
    resultado_obtenido VARCHAR(255), -- Valor o texto arrojado por el test
    observaciones TEXT,
    CONSTRAINT fk_detalle_orden FOREIGN KEY (id_orden) REFERENCES orden_laboratorio(id_orden) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_examen FOREIGN KEY (id_examen) REFERENCES examen(id_examen)
);