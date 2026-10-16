
package com.enfermeria.gestion.Seguridad;

import io.jsonwebtoken.JwtException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService usuarios;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService usuarios) {

        this.jwtService = jwtService;
        this.usuarios = usuarios;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain)
            throws ServletException, IOException {

        String encabezado = request.getHeader("Authorization");

        if (encabezado == null
                || !encabezado.startsWith("Bearer ")) {

            chain.doFilter(request, response);
            return;
        }

        String token = encabezado.substring(7).trim();

        try {

            String correo = jwtService.extraerCorreo(token);

            if (correo != null
                    && SecurityContextHolder.getContext()
                        .getAuthentication() == null) {

                UserDetails usuario =
                    usuarios.loadUserByUsername(correo);

                if (jwtService.validarToken(token, usuario)) {

                    UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                            usuario,
                            null,
                            usuario.getAuthorities()
                        );

                    SecurityContextHolder.getContext()
                        .setAuthentication(auth);
                }
            }

        } catch (JwtException
                 | IllegalArgumentException
                 | UsernameNotFoundException ex) {

            SecurityContextHolder.clearContext();

            response.setStatus(
                HttpServletResponse.SC_UNAUTHORIZED
            );

            response.setContentType(
                "application/json;charset=UTF-8"
            );

            response.getWriter().write(
                "{\"status\":401,"
                + "\"error\":\"Token inválido\","
                + "\"message\":\"El token es inválido, ha expirado o el usuario no existe.\"}"
            );

            return;
        }

        chain.doFilter(request, response);
    }
}
