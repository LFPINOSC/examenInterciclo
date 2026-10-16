package com.examen.biblioteca.dto;

import com.examen.biblioteca.model.Role;

public record AuthResponse(
        String token,
        Long id,
        String username,
        String fullName,
        String email,
        Role role
) {}
