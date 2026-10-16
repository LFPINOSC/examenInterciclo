package com.andres.odontologia_api.dto;

import java.time.LocalDateTime;

// Datos que la API devolvera al frontend
// No expone informacion de acceso de los pacientes
public record CitaRespuestaDTO(

    Long id,
    Long pacienteId,
    Long odontologoId,
    Long servicioId,
    LocalDateTime fechaHora,
    String estado,
    String observaciones

) {}