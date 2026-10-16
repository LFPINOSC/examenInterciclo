

package com.enfermeria.gestion.DTO;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record PacienteRequest(

    @NotBlank(message = "La cédula es obligatoria")
    @Pattern(
        regexp = "^[0-9]{10}$",
        message = "La cédula debe tener 10 dígitos"
    )
    String cedula,

    @NotBlank(message = "Los nombres son obligatorios")
    @Size(min = 2, max = 100)
    String nombres,

    @NotBlank(message = "Los apellidos son obligatorios")
    @Size(min = 2, max = 100)
    String apellidos,

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    @Past(message = "La fecha debe ser anterior a hoy")
    LocalDate fechaNacimiento,

    @Pattern(
        regexp = "^$|^[0-9+() -]{7,15}$",
        message = "El teléfono tiene un formato inválido"
    )
    String telefono,

    @Size(max = 200)
    String direccion

) {}
