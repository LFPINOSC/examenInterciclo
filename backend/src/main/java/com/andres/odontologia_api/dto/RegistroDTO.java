package com.andres.odontologia_api.dto;

import jakarta.validation.constraints.*;

// Recibe los datos necesarios para registrar un usuario.
public record RegistroDTO(

    // Nombre de usuario obligatorio.
    @NotBlank(message = "El usuario es obligatorio")
    @Size(min = 3, max = 50,
          message = "El usuario debe tener entre 3 y 50 caracteres")
    @Pattern(
        regexp = "^[a-zA-Z0-9._-]+$",
        message = "El usuario solo puede contener letras, numeros, puntos, guiones y guion bajo"
    )
    String username,

    // Contraseña obligatoria.
    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, max = 72,
          message = "La contraseña debe tener entre 8 y 72 caracteres")
    String password

) {}