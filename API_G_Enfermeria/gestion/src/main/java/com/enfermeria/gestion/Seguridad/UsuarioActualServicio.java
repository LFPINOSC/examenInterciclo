
package com.enfermeria.gestion.Seguridad;

import com.enfermeria.gestion.Entidades.Enfermero;
import com.enfermeria.gestion.Entidades.Usuario;
import com.enfermeria.gestion.Excepciones.RecursoNoEncontradoException;
import com.enfermeria.gestion.Repositorios.EnfermeroRepositorio;
import com.enfermeria.gestion.Repositorios.UsuarioRepositorio;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioActualServicio {

    private final UsuarioRepositorio usuarioRepositorio;
    private final EnfermeroRepositorio enfermeroRepositorio;

    public UsuarioActualServicio(
            UsuarioRepositorio usuarioRepositorio,
            EnfermeroRepositorio enfermeroRepositorio) {

        this.usuarioRepositorio = usuarioRepositorio;
        this.enfermeroRepositorio = enfermeroRepositorio;
    }

    public Long usuarioActualId() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {

            throw new AuthenticationCredentialsNotFoundException(
                    "Debes iniciar sesión para realizar esta operación");
        }

        String correo = authentication.getName();

        Usuario usuario = usuarioRepositorio
                .findByCorreoIgnoreCase(correo)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "El usuario autenticado no existe"));

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new AccessDeniedException(
                    "Tu cuenta está desactivada");
        }

        return usuario.getId();
    }

    public Long enfermeroActualId() {

        Long usuarioId = usuarioActualId();

        Enfermero enfermero = enfermeroRepositorio
                .findByUsuarioId(usuarioId)
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "Tu usuario no tiene un perfil de enfermero"));

        if (!Boolean.TRUE.equals(enfermero.getActivo())) {
            throw new AccessDeniedException(
                    "Tu perfil de enfermero está desactivado");
        }

        return enfermero.getId();
    }
}
