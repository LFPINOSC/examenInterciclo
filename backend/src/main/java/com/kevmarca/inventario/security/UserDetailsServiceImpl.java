package com.kevmarca.inventario.security;

import com.kevmarca.inventario.model.Usuario;
import com.kevmarca.inventario.repository.UsuarioRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/** Le indica a Spring Security cómo buscar un usuario en la base de datos. */
// 📌 Le dice a Spring Security cómo buscar un usuario en NUESTRA base
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public UserDetailsServiceImpl(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario u = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        return User.withUsername(u.getUsername())
                .password(u.getPassword())
                // El rol se convierte en "ROLE_ADMIN" / "ROLE_EMPLEADO" (así lo usa hasRole)
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + u.getRol().name())))
                .disabled(!u.isActivo())
                .build();
    }
}
