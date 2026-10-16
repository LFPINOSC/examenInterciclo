
package com.enfermeria.gestion.DTO;

import com.enfermeria.gestion.Entidades.Rol;

public record UsuarioResponse(
    Long id,
    String nombre,
    String correo,
    Rol rol,
    Boolean activo
) {}
