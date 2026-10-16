
package com.enfermeria.gestion.DTO;

public record EnfermeroResponse(
    Long id,
    Long usuarioId,
    String nombre,
    String correo,
    String cedula,
    String numeroLicencia,
    String telefono,
    String especialidad,
    Boolean activo
) {}
