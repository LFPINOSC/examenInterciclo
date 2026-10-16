package com.universidad.matriculas.service;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.universidad.matriculas.model.Usuario;
import com.universidad.matriculas.repository.UsuarioRepository;

/**
 * Servicio utilizado por Spring Security para buscar
 * usuarios registrados en PostgreSQL.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public CustomUserDetailsService(
            UsuarioRepository usuarioRepository
    ) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String correo)
            throws UsernameNotFoundException {

        Usuario usuario = usuarioRepository
                .findByCorreo(correo)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "Usuario no encontrado"
                        )
                );

        return User
                .withUsername(usuario.getCorreo())
                .password(usuario.getPassword())

                // roles() agrega automaticamente ROLE_
                // ADMIN -> ROLE_ADMIN
                // ESTUDIANTE -> ROLE_ESTUDIANTE
                .roles(usuario.getRol().name())

                // Si activo=false, Spring no permite el acceso
                .disabled(!Boolean.TRUE.equals(usuario.getActivo()))

                .build();
    }
}