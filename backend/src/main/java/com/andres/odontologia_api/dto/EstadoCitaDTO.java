package com.andres.odontologia_api.dto;

import jakarta.validation.constraints.*;

// Permite cambiar el estado de una cita
public record EstadoCitaDTO(

    @NotBlank(message = "El estado es obligatorio")
    @Pattern(
        regexp = "PENDIENTE|CONFIRMADA|ATENDIDA|CANCELADA",
        message = "Estado no valido"
    )
    String estado

) {}