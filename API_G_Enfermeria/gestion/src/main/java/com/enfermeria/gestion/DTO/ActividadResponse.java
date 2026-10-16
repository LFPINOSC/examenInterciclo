
package com.enfermeria.gestion.DTO;

import com.enfermeria.gestion.Entidades.*;
import java.time.LocalDateTime;

public record ActividadResponse(
    Long id,
    Long pacienteId,
    String nombrePaciente,
    Long enfermeroId,
    String nombreEnfermero,
    Long turnoId,
    TipoActividad tipo,
    String descripcion,
    LocalDateTime fechaProgramada,
    EstadoActividad estado
) {}
