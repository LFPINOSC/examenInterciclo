
package com.enfermeria.gestion.DTO;

import jakarta.validation.constraints.*;

public record EnfermeroRequest(
    @NotNull(message = "Debe seleccionar un usuario")
    Long usuarioId,

    @NotBlank(message = "La cédula es obligatoria")
    @Pattern(regexp = "^[0-9]{10}$",
             message = "La cédula debe tener 10 dígitos")
    String cedula,

    @NotBlank(message = "La licencia profesional es obligatoria")
    String numeroLicencia,

    String telefono,
    String especialidad
) {}
