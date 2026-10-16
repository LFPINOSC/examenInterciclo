package ec.edu.ucacue.ordenes.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "El usuario o correo es obligatorio") String username,
        @NotBlank(message = "La contrasena es obligatoria") String password) {
}
