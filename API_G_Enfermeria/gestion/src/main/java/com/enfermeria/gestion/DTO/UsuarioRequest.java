
package com.enfermeria.gestion.DTO;

import com.enfermeria.gestion.Entidades.Rol;
import jakarta.validation.constraints.*;

public record UsuarioRequest(
    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 100)
    String nombre,

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no es válido")
    String correo,

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    String password,

    @NotNull(message = "El rol es obligatorio")
    Rol rol
) {}
