-- Consultas de apoyo para explicar el modelo en la defensa.

-- Pacientes con hospitalización activa, su cama y el médico responsable.
SELECT
  h.codigo,
  p.cedula,
  p.nombres || ' ' || p.apellidos AS paciente,
  hab.numero AS habitacion,
  hab.tipo,
  m.nombres || ' ' || m.apellidos AS medico,
  h.fecha_ingreso,
  h.diagnostico_ingreso
FROM hospitalizaciones h
JOIN pacientes p ON p.id_paciente = h.id_paciente
JOIN habitaciones hab ON hab.id_habitacion = h.id_habitacion
JOIN medicos m ON m.id_medico = h.id_medico
WHERE h.estado = 'ACTIVA';

-- Ocupación por piso.
SELECT
  piso,
  COUNT(*) AS total,
  SUM(CASE WHEN estado = 'OCUPADA' THEN 1 ELSE 0 END) AS ocupadas,
  SUM(CASE WHEN estado = 'DISPONIBLE' THEN 1 ELSE 0 END) AS disponibles
FROM habitaciones
GROUP BY piso
ORDER BY piso;

-- Historial de un paciente (una persona, varias estancias).
SELECT codigo, fecha_ingreso, fecha_alta, estado, diagnostico_ingreso
FROM hospitalizaciones
WHERE id_paciente = 1
ORDER BY fecha_ingreso;
