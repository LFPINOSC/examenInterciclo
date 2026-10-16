
package com.enfermeria.gestion.DTO;

import com.enfermeria.gestion.Entidades.TipoActividad;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public record ActividadRequest(

    @NotNull(message = "Debe seleccionar un paciente")
    Long pacienteId,

    @NotNull(message = "Debe seleccionar un enfermero")
    Long enfermeroId,

    Long turnoId,

    @NotNull(message = "El tipo de actividad es obligatorio")
    TipoActividad tipo,

    @NotBlank(message = "La descripción es obligatoria")
    @Size(min = 5, max = 1000)
    String descripcion,

    @NotNull(message = "La fecha programada es obligatoria")
    LocalDateTime fechaProgramada

) {}
