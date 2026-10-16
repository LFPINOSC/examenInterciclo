package com.gestiondocentes.api.security;

import com.gestiondocentes.api.entity.Usuario;
import com.gestiondocentes.api.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
  private final UsuarioRepository r;

  public CustomUserDetailsService(UsuarioRepository r) {
    this.r = r;
  }

  public UserDetails loadUserByUsername(String correo) {
    Usuario u =
        r.findByCorreo(correo)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    return User.withUsername(u.getCorreo())
        .password(u.getPassword())
        .roles(u.getRol().name())
        .build();
  }
}
