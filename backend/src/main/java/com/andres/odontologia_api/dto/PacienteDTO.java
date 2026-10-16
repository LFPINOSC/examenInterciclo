package com.andres.odontologia_api.dto;

import jakarta.validation.constraints.*;

// Datos del paciente que recibe y devuelve la API.
// No incluye informacion privada de su cuenta de usuario.
public record PacienteDTO(

    Long id,

    @NotBlank(message = "La cedula es obligatoria")
    @Pattern(
        regexp = "\\d{10}",
        message = "La cedula debe tener 10 digitos"
    )
    String cedula,

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100)
    String nombre,

    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 100)
    String apellido,

    @Size(max = 20)
    String telefono,

    @Email(message = "Correo no valido")
    @Size(max = 100)
    String correo,

    @Size(max = 200)
    String direccion
) {}