
package com.enfermeria.gestion.DTO;

import java.time.LocalDateTime;

public record RegistroActividadResponse(
    Long id,
    Long actividadId,
    Long enfermeroId,
    LocalDateTime fechaRegistro,
    String resultado,
    String observaciones
) {}
