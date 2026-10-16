package com.kevmarca.inventario.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Se ejecuta una vez por cada petición.
 * Lee la cabecera "Authorization: Bearer <token>", valida el token y,
 * si es correcto, registra al usuario como autenticado en el SecurityContext.
 */
// 📌 Se ejecuta en CADA petición: lee "Authorization: Bearer <token>"
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String cabecera = request.getHeader("Authorization");

        if (cabecera != null && cabecera.startsWith("Bearer ")
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            // substring(7) quita "Bearer " y deja solo el token
            String token = cabecera.substring(7);
            String username = jwtService.validarYObtenerUsuario(token);

            if (username != null) {
                try {
                    UserDetails usuario = userDetailsService.loadUserByUsername(username);
                    if (usuario.isEnabled()) {
                        UsernamePasswordAuthenticationToken autenticacion =
                                new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities());
                        autenticacion.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        // A partir de aquí Spring sabe quién es el usuario y su rol
                        SecurityContextHolder.getContext().setAuthentication(autenticacion);
                    }
                } catch (UsernameNotFoundException ignored) {
                    // el usuario fue eliminado: la petición seguirá sin autenticación (401)
                }
            }
        }
        // Continúa con el siguiente filtro (si no hay token válido, SecurityConfig responde 401)
        chain.doFilter(request, response);
    }
}
