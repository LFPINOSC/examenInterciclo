package com.gestiondocentes.api.dto;

import jakarta.validation.constraints.*;

public record VerificacionRequest(
        @NotBlank @Email String correo,
        @NotBlank @Pattern(regexp="^\\d{6}$",message="El codigo debe tener exactamente 6 digitos") String codigo
) {
}
