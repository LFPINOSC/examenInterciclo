package com.andres.odontologia_api.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.*;

// Datos que Angular enviara para registrar o editar una cita
public record CitaSolicitudDTO(

    @NotNull(message = "El paciente es obligatorio")
    Long pacienteId,

    @NotNull(message = "El odontologo es obligatorio")
    Long odontologoId,

    @NotNull(message = "El servicio es obligatorio")
    Long servicioId,

    @NotNull(message = "La fecha es obligatoria")
    LocalDateTime fechaHora,

    @Size(max = 255)
    String observaciones

) {}