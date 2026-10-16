package com.gestiondocentes.api.dto;

import jakarta.validation.constraints.*;

public record ReenviarCodigoRequest(
        @NotBlank @Email String correo
) {
}
