
package com.enfermeria.gestion.Seguridad;

import com.enfermeria.gestion.Entidades.Usuario;
import com.enfermeria.gestion.Repositorios.UsuarioRepositorio;

import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepositorio usuarios;

    public CustomUserDetailsService(UsuarioRepositorio usuarios) {
        this.usuarios = usuarios;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String correo)
            throws UsernameNotFoundException {

        Usuario usuario = usuarios.findByCorreoIgnoreCase(correo)
            .orElseThrow(() ->
                new UsernameNotFoundException(
                    "Credenciales incorrectas"));

        return User.builder()
            .username(usuario.getCorreo())
            .password(usuario.getPasswordHash())
            .authorities("ROLE_" + usuario.getRol().name())
            .disabled(!Boolean.TRUE.equals(usuario.getActivo()))
            .build();
    }
}
