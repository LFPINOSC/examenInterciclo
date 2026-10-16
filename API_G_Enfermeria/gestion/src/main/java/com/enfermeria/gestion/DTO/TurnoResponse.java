
package com.enfermeria.gestion.DTO;

import java.time.LocalDateTime;

public record TurnoResponse(
    Long id,
    Long enfermeroId,
    String nombreEnfermero,
    LocalDateTime fechaInicio,
    LocalDateTime fechaFin,
    String observaciones,
    Boolean activo
) {}
