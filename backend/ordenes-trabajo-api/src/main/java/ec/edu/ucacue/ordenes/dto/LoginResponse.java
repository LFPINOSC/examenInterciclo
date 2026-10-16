package ec.edu.ucacue.ordenes.dto;

import java.time.LocalDateTime;

public record LoginResponse(String token, String username, String nombre, String rol, LocalDateTime expira) {
}
