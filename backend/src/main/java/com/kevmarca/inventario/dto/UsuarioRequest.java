package com.kevmarca.inventario.dto;

import com.kevmarca.inventario.model.Rol;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Al actualizar, la contraseña es opcional: si viene vacía se conserva la actual. */
// 📌 Datos para crear/editar usuario. La contraseña se cifra en UsuarioService
public record UsuarioRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100)
        String nombre,

        @NotBlank(message = "El usuario es obligatorio")
        @Size(min = 4, max = 50, message = "El usuario debe tener entre 4 y 50 caracteres")
        String username,

        String password,

        @NotNull(message = "El rol es obligatorio")
        Rol rol,

        Boolean activo
) {}
