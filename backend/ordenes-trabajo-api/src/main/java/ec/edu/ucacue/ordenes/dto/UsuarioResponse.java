package ec.edu.ucacue.ordenes.dto;

import java.time.LocalDateTime;

public record UsuarioResponse(Long id, String username, String nombre, String correo, String rol,
                              boolean activo, LocalDateTime ultimoAcceso, LocalDateTime fechaRegistro) {
}
