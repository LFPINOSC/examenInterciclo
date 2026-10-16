package com.gestiondocentes.api.dto;

import com.gestiondocentes.api.entity.EstadoDocente;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record DocenteRequest(
        @NotBlank
        @Pattern(
                regexp = "^\\d{10}$",
                message = "La cédula debe tener 10 dígitos"
        )
        String cedula,

        @NotBlank
        @Size(max = 80)
        String nombres,

        @NotBlank
        @Size(max = 80)
        String apellidos,

        @NotBlank
        @Email
        String correoInstitucional,

        @NotBlank
        @Pattern(
                regexp = "^09\\d{8}$",
                message = "El teléfono debe iniciar con 09 y tener 10 dígitos"
        )
        String telefono,

        @NotBlank
        @Size(max = 120)
        String titulo,

        @NotNull
        LocalDate fechaIngreso,

        @NotNull
        EstadoDocente estado
) {
}
