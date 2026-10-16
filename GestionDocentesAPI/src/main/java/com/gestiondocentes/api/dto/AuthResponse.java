package com.gestiondocentes.api.dto;

public record AuthResponse(
        String token,
        String rol,
        Long id,
        String nombre,
        String correo
) {
}
