package com.gestiondocentes.api.dto;

import com.gestiondocentes.api.entity.*;
import java.time.LocalDateTime;

public record UsuarioResponse(
        Long id,
        String nombre,
        String cedula,
        String telefono,
        String correo,
        Rol rol,
        EstadoUsuario estado,
        boolean verificado,
        LocalDateTime fechaRegistro
) {
}
