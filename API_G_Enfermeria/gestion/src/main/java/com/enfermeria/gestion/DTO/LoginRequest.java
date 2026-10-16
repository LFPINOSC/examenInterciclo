
package com.enfermeria.gestion.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Ingresa un correo válido")
    String correo,

    @NotBlank(message = "La contraseña es obligatoria")
    String password

) {}
