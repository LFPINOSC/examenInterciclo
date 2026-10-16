-- =====================================================================
--  DATOS DE PRUEBA - Control de Vacunación
--  Ejecutar DESPUÉS de 01_schema.sql
-- =====================================================================

-- Asegura que los acentos y la ñ se lean correctamente desde cualquier consola
SET NAMES utf8mb4;
USE control_vacunacion;

-- Usuarios de prueba (hash bcrypt, costo 10)
--   admin@vacunas.local     / Admin123*      (ADMIN)
--   enfermera@vacunas.local / Enfermero123*  (ENFERMERO)
INSERT INTO roles (id, nombre, descripcion) VALUES
(1, 'ADMIN',     'Administra usuarios, catálogo de vacunas y lotes; puede eliminar registros'),
(2, 'ENFERMERO', 'Registra pacientes y aplica vacunas; consulta catálogo e inventario');

INSERT INTO usuarios (rol_id, nombre, email, password_hash) VALUES
(1, 'Administrador del Sistema', 'admin@vacunas.local',
 '$2a$10$Atb1l5JKP.wR/59IMjpkZuHW5i2lukROE7yygh.uwkWCV4C9iaFzi'),
(2, 'Lcda. María Pérez', 'enfermera@vacunas.local',
 '$2a$10$NUl6LA.LZme.uktuV8doNunQoedzegmjmKHwvkUBgKZU8Q6/tRQlO');

INSERT INTO vacunas (nombre, enfermedad, fabricante, dosis_requeridas, intervalo_dias, edad_minima_meses, descripcion) VALUES
('BCG',                 'Tuberculosis',                                   'Serum Institute', 1,   0,   0, 'Dosis única al nacer'),
('Hepatitis B pediátrica','Hepatitis B',                                  'GSK',             1,   0,   0, 'Primeras 24 horas de vida'),
('Rotavirus',           'Diarrea por rotavirus',                          'GSK',             2,  60,   2, 'Vía oral'),
('Pentavalente',        'Difteria, tétanos, tosferina, hepatitis B, Hib', 'Serum Institute', 3,  60,   2, 'Esquema 2, 4 y 6 meses'),
('Neumococo conjugada', 'Neumonía y meningitis neumocócica',              'Pfizer',          3,  60,   2, 'Esquema 2, 4 y 6 meses'),
('SRP',                 'Sarampión, rubéola, parotiditis',                'Serum Institute', 2, 180,  12, 'Primera dosis a los 12 meses'),
('Fiebre amarilla',     'Fiebre amarilla',                                'Sanofi',          1,   0,  12, 'Dosis única'),
('Influenza estacional','Influenza',                                      'Sanofi',          1,   0,   6, 'Campaña anual'),
('VPH',                 'Virus del papiloma humano',                      'MSD',             2, 180, 108, 'Desde los 9 años'),
('COVID-19',            'COVID-19',                                       'Pfizer',          2,  28,  60, 'Esquema primario');

INSERT INTO lotes (vacuna_id, numero_lote, fecha_caducidad, cantidad_disponible, fecha_ingreso) VALUES
(1,  'BCG-2026-001',  '2027-06-30', 50, '2026-07-01'),
(2,  'HB-2026-014',   '2027-03-31', 40, '2026-07-01'),
(3,  'ROT-2026-007',  '2026-11-05',  8, '2026-05-10'),   -- por caducar y stock bajo
(4,  'PEN-2026-022',  '2027-08-31', 60, '2026-08-15'),
(5,  'NEU-2026-031',  '2027-05-31', 45, '2026-08-15'),
(6,  'SRP-2026-003',  '2027-01-31', 30, '2026-06-20'),
(7,  'FA-2026-009',   '2027-09-30', 25, '2026-09-01'),
(8,  'INF-2026-101',  '2027-04-30', 120,'2026-09-15'),
(9,  'VPH-2026-005',  '2027-12-31', 35, '2026-09-20'),
(10, 'COV-2026-044',  '2026-08-01', 10, '2026-02-01');   -- caducado (no se puede usar)

INSERT INTO pacientes (cedula, nombres, apellidos, fecha_nacimiento, sexo, telefono, direccion, representante) VALUES
('0104523188', 'Mateo Sebastián', 'Guamán Ortiz',   '2026-03-10', 'M', '0991234567', 'Av. Huayna Cápac y Pío Bravo, Cuenca', 'Ana Ortiz'),
('0301456729', 'Valentina',       'Rojas Peña',     '2025-08-22', 'F', '0987654321', 'Calle Bolívar 3-45, Azogues',         'Luis Rojas'),
('0107894511', 'Carlos Andrés',   'Méndez Vega',    '1990-05-14', 'M', '0998877665', 'Av. Solano 12-30, Cuenca',             NULL),
('0303128748', 'Daniela',         'Torres Quizhpi', '2016-11-02', 'F', '0976543210', 'Sector El Cebollar, Cuenca',           'Rosa Quizhpi'),
('0102234671', 'Lucía',           'Andrade Bravo',  '1985-01-30', 'F', '0965432109', 'Av. Ordóñez Lasso, Cuenca',            NULL);

-- Historial de aplicaciones (usuario 2 = enfermera)
INSERT INTO aplicaciones (paciente_id, lote_id, usuario_id, numero_dosis, fecha_aplicacion, sitio_aplicacion, proxima_dosis, observaciones) VALUES
(1, 1, 2, 1, '2026-03-11', 'INTRADERMICA',   NULL,         'Sin reacciones'),
(1, 2, 2, 1, '2026-03-11', 'MUSLO_DERECHO',  NULL,         NULL),
(1, 4, 2, 1, '2026-05-12', 'MUSLO_IZQUIERDO','2026-07-11', NULL),
(1, 4, 2, 2, '2026-07-13', 'MUSLO_IZQUIERDO','2026-09-11', 'Fiebre leve 24 h'),
(1, 5, 2, 1, '2026-05-12', 'MUSLO_DERECHO',  '2026-07-11', NULL),
(2, 4, 2, 1, '2025-10-25', 'MUSLO_IZQUIERDO','2025-12-24', NULL),
(2, 4, 2, 2, '2025-12-26', 'MUSLO_IZQUIERDO','2026-02-24', NULL),
(2, 4, 2, 3, '2026-02-25', 'MUSLO_IZQUIERDO', NULL,        'Esquema completo'),
(3, 8, 1, 1, '2026-09-20', 'BRAZO_IZQUIERDO', NULL,        NULL),
(4, 9, 2, 1, '2026-09-25', 'BRAZO_DERECHO',  '2027-03-24', NULL);

-- El stock refleja las dosis ya aplicadas
UPDATE lotes SET cantidad_disponible = cantidad_disponible - 1 WHERE id IN (1, 2, 9, 8);
UPDATE lotes SET cantidad_disponible = cantidad_disponible - 5 WHERE id = 4;
UPDATE lotes SET cantidad_disponible = cantidad_disponible - 1 WHERE id = 5;
