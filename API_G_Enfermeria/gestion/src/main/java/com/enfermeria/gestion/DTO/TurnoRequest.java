
package com.enfermeria.gestion.DTO;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public record TurnoRequest(

    @NotNull(message = "Debe seleccionar un enfermero")
    Long enfermeroId,

    @NotNull(message = "La fecha de inicio es obligatoria")
    LocalDateTime fechaInicio,

    @NotNull(message = "La fecha de fin es obligatoria")
    LocalDateTime fechaFin,

    @Size(max = 200)
    String observaciones

) {
    @AssertTrue(message = "La fecha de fin debe ser posterior al inicio")
    public boolean isHorarioValido() {
        return fechaInicio == null ||
               fechaFin == null ||
               fechaFin.isAfter(fechaInicio);
    }
}
