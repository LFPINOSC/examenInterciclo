package com.andres.odontologia_api.dto;

import com.andres.odontologia_api.modelo.Usuario;

// ==========================================
// DTO PARA MOSTRAR INFORMACION DE USUARIOS
// ==========================================

// Este DTO evita enviar contraseñas al frontend.
// Solo incluye la informacion necesaria
// para la administracion de usuarios.

public record UsuarioResumenDTO(

        Long id,
        String username,
        String rol,
        boolean activo

) {

    // ==========================================
    // CONVERTIR ENTIDAD USUARIO A DTO
    // ==========================================

    public static UsuarioResumenDTO desde(Usuario usuario) {

        return new UsuarioResumenDTO(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getRol(),
                usuario.isActivo()
        );

    }
}