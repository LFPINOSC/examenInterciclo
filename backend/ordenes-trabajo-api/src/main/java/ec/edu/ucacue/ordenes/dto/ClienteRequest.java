package ec.edu.ucacue.ordenes.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ClienteRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 120, message = "El nombre no puede superar 120 caracteres")
        String nombre,

        @NotBlank(message = "La cedula es obligatoria")
        @Pattern(regexp = "^\\d{10}$", message = "La cedula debe tener 10 digitos")
        String cedula,

        @Pattern(regexp = "^(\\d{7,10})?$", message = "El telefono debe tener de 7 a 10 digitos")
        String telefono,

        @Email(message = "El correo no es valido")
        @Size(max = 120, message = "El correo no puede superar 120 caracteres")
        String correo,

        @Size(max = 200, message = "La direccion no puede superar 200 caracteres")
        String direccion) {
}
