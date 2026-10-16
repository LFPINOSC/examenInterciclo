
package com.enfermeria.gestion.DTO;

import com.enfermeria.gestion.Entidades.Rol;

public record LoginResponse(
    String token,
    String tipo,
    Long usuarioId,
    String nombre,
    String correo,
    Rol rol
) {}
