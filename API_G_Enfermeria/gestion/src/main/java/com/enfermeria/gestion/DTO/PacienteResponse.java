
package com.enfermeria.gestion.DTO;

import java.time.LocalDate;

public record PacienteResponse(
    Long id,
    String cedula,
    String nombres,
    String apellidos,
    LocalDate fechaNacimiento,
    String telefono,
    String direccion,
    Boolean activo
) {}
