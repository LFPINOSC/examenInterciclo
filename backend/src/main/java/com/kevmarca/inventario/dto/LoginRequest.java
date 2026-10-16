package com.kevmarca.inventario.dto;

import jakarta.validation.constraints.NotBlank;

// 📌 DTO = "caja" de datos que llega del frontend. record = clase inmutable corta
public record LoginRequest(
        @NotBlank(message = "El usuario es obligatorio") String username,
        @NotBlank(message = "La contraseña es obligatoria") String password
) {}
