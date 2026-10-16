-- Pacientes hospitalizados hoy
SELECT h.codigo, p.nombres || ' ' || p.apellidos AS paciente, hab.numero, h.medico_responsable
FROM hospitalizaciones h
JOIN pacientes p ON p.id_paciente = h.id_paciente
JOIN habitaciones hab ON hab.id_habitacion = h.id_habitacion
WHERE h.estado = 'ACTIVA';
