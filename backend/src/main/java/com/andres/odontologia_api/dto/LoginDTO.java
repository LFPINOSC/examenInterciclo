package com.andres.odontologia_api.dto;

import jakarta.validation.constraints.*;

// Recibe las credenciales para iniciar sesion.
public record LoginDTO(

    // Nombre de usuario.
    @NotBlank(message = "Ingresa tu usuario")
    String username,

    // Contraseña.
    @NotBlank(message = "Ingresa tu contraseña")
    String password

) {}