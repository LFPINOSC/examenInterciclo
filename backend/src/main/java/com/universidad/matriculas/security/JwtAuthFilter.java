package com.universidad.matriculas.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.universidad.matriculas.service.CustomUserDetailsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Filtro que revisa cada petición y valida
 * el token JWT enviado desde el frontend.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader =
                request.getHeader("Authorization");

        // Si no existe token Bearer,
        // dejamos continuar la petición.
        if (authHeader == null
                || !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        String token =
                authHeader.substring(7);

        try {

            String correo =
                    jwtService.obtenerCorreo(token);

            if (correo != null
                    && SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {

                UserDetails usuario =
                        userDetailsService
                                .loadUserByUsername(correo);

                if (jwtService.tokenValido(
                        token,
                        usuario
                )) {

                    UsernamePasswordAuthenticationToken authentication =
                            UsernamePasswordAuthenticationToken
                                    .authenticated(
                                            usuario,
                                            null,
                                            usuario.getAuthorities()
                                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authentication);
                }
            }

        } catch (Exception e) {

            // Si el token es inválido o expiró,
            // el usuario simplemente queda sin autenticar.
        }

        filterChain.doFilter(
                request,
                response
        );
    }
}