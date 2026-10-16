-- =====================================================================
--  SISTEMA DE CONTROL DE VACUNACIÓN
--  Autor : Javier Alexander Carrera Rodriguez
--  Motor : MySQL 8+  (InnoDB, utf8mb4)
--  Script: creación de la base de datos y sus tablas
-- =====================================================================

-- Asegura que los acentos y la ñ se lean correctamente desde cualquier consola
SET NAMES utf8mb4;

DROP DATABASE IF EXISTS control_vacunacion;
CREATE DATABASE control_vacunacion
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE control_vacunacion;

-- ---------------------------------------------------------------------
-- ROLES: perfiles de acceso. El backend autoriza por el nombre del rol.
--   ADMIN     -> gestiona usuarios, catálogo de vacunas y lotes.
--   ENFERMERO -> registra pacientes y aplica vacunas.
-- Se separa en tabla (y no un ENUM) para poder describir cada rol y
-- relacionarlo con los usuarios mediante una FK (1 rol : N usuarios).
-- ---------------------------------------------------------------------
CREATE TABLE roles (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(30)  NOT NULL,
  descripcion  VARCHAR(150) NULL,
  CONSTRAINT uq_roles_nombre UNIQUE (nombre)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- USUARIOS: personal que inicia sesión en el sistema.
-- La contraseña NUNCA se guarda en texto plano: se guarda el hash bcrypt.
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  rol_id         INT          NOT NULL,
  nombre         VARCHAR(100) NOT NULL,
  email          VARCHAR(120) NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  activo         TINYINT(1)   NOT NULL DEFAULT 1,
  creado_en      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_usuarios_email UNIQUE (email),
  CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id)
    REFERENCES roles(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- PACIENTES: personas que reciben vacunas.
-- La cédula es clave candidata (UNIQUE); se usa un id surrogate como PK
-- para que las FK sean pequeñas y la cédula pueda corregirse.
-- ---------------------------------------------------------------------
CREATE TABLE pacientes (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  cedula            CHAR(10)     NOT NULL,
  nombres           VARCHAR(80)  NOT NULL,
  apellidos         VARCHAR(80)  NOT NULL,
  fecha_nacimiento  DATE         NOT NULL,
  sexo              ENUM('M','F') NOT NULL,
  telefono          VARCHAR(15)  NULL,
  direccion         VARCHAR(200) NULL,
  representante     VARCHAR(120) NULL COMMENT 'Obligatorio en la app si el paciente es menor de edad',
  creado_en         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_pacientes_cedula UNIQUE (cedula)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- VACUNAS: catálogo y esquema de cada vacuna (cuántas dosis, cada cuánto
-- y desde qué edad). Estas reglas se usan para validar las aplicaciones
-- y calcular la fecha de la próxima dosis.
-- ---------------------------------------------------------------------
CREATE TABLE vacunas (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  nombre             VARCHAR(80)  NOT NULL,
  enfermedad         VARCHAR(150) NOT NULL COMMENT 'Enfermedad(es) que previene',
  fabricante         VARCHAR(80)  NULL,
  dosis_requeridas   TINYINT      NOT NULL DEFAULT 1,
  intervalo_dias     SMALLINT     NOT NULL DEFAULT 0 COMMENT 'Días mínimos entre dosis',
  edad_minima_meses  SMALLINT     NOT NULL DEFAULT 0,
  descripcion        VARCHAR(300) NULL,
  CONSTRAINT uq_vacunas_nombre UNIQUE (nombre),
  CONSTRAINT ck_vacunas_dosis     CHECK (dosis_requeridas BETWEEN 1 AND 10),
  CONSTRAINT ck_vacunas_intervalo CHECK (intervalo_dias >= 0),
  CONSTRAINT ck_vacunas_edad      CHECK (edad_minima_meses >= 0)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- LOTES: inventario físico de cada vacuna. Un lote pertenece a UNA vacuna
-- y una vacuna tiene MUCHOS lotes (1:N). Permite controlar stock y
-- caducidad, y dar trazabilidad (qué lote recibió cada paciente).
-- ---------------------------------------------------------------------
CREATE TABLE lotes (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  vacuna_id            INT          NOT NULL,
  numero_lote          VARCHAR(40)  NOT NULL,
  fecha_caducidad      DATE         NOT NULL,
  cantidad_disponible  INT          NOT NULL DEFAULT 0,
  fecha_ingreso        DATE         NOT NULL DEFAULT (CURRENT_DATE),
  CONSTRAINT uq_lotes_numero UNIQUE (numero_lote),
  CONSTRAINT ck_lotes_cantidad CHECK (cantidad_disponible >= 0),
  CONSTRAINT fk_lotes_vacuna FOREIGN KEY (vacuna_id)
    REFERENCES vacunas(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- APLICACIONES: hecho central del sistema. Resuelve la relación N:M entre
-- PACIENTES y VACUNAS (un paciente recibe muchas vacunas y una vacuna se
-- aplica a muchos pacientes). Se relaciona con el LOTE (no directamente
-- con la vacuna) para conservar trazabilidad; la vacuna se obtiene por
-- lotes.vacuna_id y así se evita redundancia (3FN).
-- ON DELETE RESTRICT: no se puede borrar un paciente, lote o usuario que
-- tenga historial clínico de vacunación.
-- ---------------------------------------------------------------------
CREATE TABLE aplicaciones (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  paciente_id       INT          NOT NULL,
  lote_id           INT          NOT NULL,
  usuario_id        INT          NOT NULL COMMENT 'Profesional que aplicó la dosis',
  numero_dosis      TINYINT      NOT NULL,
  fecha_aplicacion  DATE         NOT NULL,
  sitio_aplicacion  ENUM('BRAZO_IZQUIERDO','BRAZO_DERECHO','MUSLO_IZQUIERDO',
                         'MUSLO_DERECHO','ORAL','INTRADERMICA') NOT NULL,
  proxima_dosis     DATE         NULL COMMENT 'NULL cuando el esquema queda completo',
  observaciones     VARCHAR(300) NULL,
  creado_en         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ck_aplicaciones_dosis CHECK (numero_dosis >= 1),
  CONSTRAINT fk_aplicaciones_paciente FOREIGN KEY (paciente_id)
    REFERENCES pacientes(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_aplicaciones_lote FOREIGN KEY (lote_id)
    REFERENCES lotes(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_aplicaciones_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Índices para las consultas más frecuentes
CREATE INDEX idx_pacientes_apellidos      ON pacientes (apellidos, nombres);
CREATE INDEX idx_aplicaciones_paciente    ON aplicaciones (paciente_id, fecha_aplicacion);
CREATE INDEX idx_aplicaciones_proxima     ON aplicaciones (proxima_dosis);
CREATE INDEX idx_lotes_caducidad          ON lotes (fecha_caducidad);
