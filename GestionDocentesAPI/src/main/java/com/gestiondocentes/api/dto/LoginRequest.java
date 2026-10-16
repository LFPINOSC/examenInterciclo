package com.gestiondocentes.api.dto;

import jakarta.validation.constraints.*;

public record LoginRequest(
        @NotBlank @Email String correo,
        @NotBlank String password
) {
}
