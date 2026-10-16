-- MariaDB. No elimina tablas existentes. Ejecutado por Spring al iniciar.
CREATE TABLE IF NOT EXISTS usuarios (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 nombre VARCHAR(100) NOT NULL,
 email VARCHAR(160) NOT NULL UNIQUE,
 password_hash VARCHAR(100) NOT NULL,
 rol VARCHAR(10) NOT NULL CHECK (rol IN ('ADMIN','USUARIO')),
 activo BOOLEAN NOT NULL DEFAULT TRUE,
 token_version INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS hoteles (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 nombre VARCHAR(100) NOT NULL,
 ciudad VARCHAR(80) NOT NULL,
 direccion VARCHAR(200) NOT NULL,
 descripcion VARCHAR(500) NOT NULL
);
CREATE TABLE IF NOT EXISTS tipos_habitacion (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 nombre VARCHAR(60) NOT NULL UNIQUE,
 descripcion VARCHAR(300) NOT NULL
);
CREATE TABLE IF NOT EXISTS habitaciones (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 hotel_id BIGINT NOT NULL,
 tipo_id BIGINT NOT NULL,
 numero VARCHAR(15) NOT NULL,
 precio_noche DECIMAL(10,2) NOT NULL CHECK (precio_noche > 0),
 capacidad INTEGER NOT NULL CHECK (capacidad BETWEEN 1 AND 20),
 activa BOOLEAN NOT NULL DEFAULT TRUE,
 CONSTRAINT uk_habitacion UNIQUE (hotel_id, numero),
 CONSTRAINT fk_habitacion_hotel FOREIGN KEY (hotel_id) REFERENCES hoteles(id),
 CONSTRAINT fk_habitacion_tipo FOREIGN KEY (tipo_id) REFERENCES tipos_habitacion(id)
);
CREATE TABLE IF NOT EXISTS reservas (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 usuario_id BIGINT NOT NULL,
 habitacion_id BIGINT NOT NULL,
 entrada DATE NOT NULL,
 salida DATE NOT NULL,
 huespedes INTEGER NOT NULL CHECK (huespedes > 0),
 precio_noche DECIMAL(10,2) NOT NULL,
 total DECIMAL(12,2) NOT NULL,
 estado VARCHAR(15) NOT NULL CHECK (estado IN ('CONFIRMADA','CANCELADA')),
 CONSTRAINT ck_fechas CHECK (salida > entrada),
 CONSTRAINT fk_reserva_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
 CONSTRAINT fk_reserva_habitacion FOREIGN KEY (habitacion_id) REFERENCES habitaciones(id)
);

-- Tabla técnica: evita recargar los datos de ejemplo tras borrarlos.
CREATE TABLE IF NOT EXISTS inicializacion (clave VARCHAR(40) PRIMARY KEY);
