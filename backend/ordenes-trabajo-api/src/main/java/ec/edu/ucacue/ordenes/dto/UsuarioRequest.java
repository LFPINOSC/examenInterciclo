package ec.edu.ucacue.ordenes.dto;

import ec.edu.ucacue.ordenes.entidad.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Alta/edicion de usuario. En la edicion la contrasena es opcional (vacia = no cambia). */
public record UsuarioRequest(
        @NotBlank(message = "El usuario es obligatorio")
        @Pattern(regexp = "^[A-Za-z0-9_.]{3,30}$", message = "El usuario debe tener 3 a 30 letras, numeros, punto o guion bajo")
        String username,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
        String nombre,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no es valido")
        @Size(max = 120, message = "El correo no puede superar 120 caracteres")
        String correo,

        String password,

        @NotNull(message = "El rol es obligatorio") Rol rol) {
}
