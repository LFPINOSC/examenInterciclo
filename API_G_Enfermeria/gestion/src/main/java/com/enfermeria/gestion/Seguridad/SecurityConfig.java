
package com.enfermeria.gestion.Seguridad;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            CustomUserDetailsService userDetailsService) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
    }

    // Cifrado de contraseñas
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Autenticación con usuarios de PostgreSQL
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    // Administrador de autenticación
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }

    // Configuración CORS para Angular
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:4200")
        );

        configuration.setAllowedMethods(
                List.of(
                    "GET",
                    "POST",
                    "PUT",
                    "PATCH",
                    "DELETE",
                    "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("Authorization", "Content-Type")
        );

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    // Seguridad principal de la API
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .cors(cors -> cors.configurationSource(
                    corsConfigurationSource()
            ))

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .authenticationProvider(
                authenticationProvider()
            )

            .authorizeHttpRequests(auth -> auth

                // LOGIN SIN TOKEN
                .requestMatchers(
                    "/api/auth/**"
                ).permitAll()

                // SWAGGER SIN TOKEN
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/v3/api-docs.yaml"
                ).permitAll()

                // USUARIOS: SOLO ADMIN
                .requestMatchers(
                    "/api/usuarios/**"
                ).hasRole("ADMIN")

                // PACIENTES: SOLO ADMIN
                .requestMatchers(
                    "/api/pacientes/**"
                ).hasRole("ADMIN")

                // ENFERMEROS: SOLO ADMIN
                .requestMatchers(
                    "/api/enfermeros/**"
                ).hasRole("ADMIN")

                // TURNOS DEL ENFERMERO
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/turnos/mis-turnos"
                ).hasRole("ENFERMERO")

                // GESTIÓN DE TURNOS
                .requestMatchers(
                    "/api/turnos/**"
                ).hasRole("ADMIN")

                // ACTIVIDADES DEL ENFERMERO
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/actividades/mis-actividades"
                ).hasRole("ENFERMERO")

                // GESTIÓN DE ACTIVIDADES
                .requestMatchers(
                    "/api/actividades/**"
                ).hasRole("ADMIN")

                // REGISTROS DE ACTIVIDADES
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/registros/actividad/*"
                ).hasRole("ENFERMERO")

                .requestMatchers(
                    "/api/registros/**"
                ).hasRole("ADMIN")

                // CUALQUIER OTRA RUTA REQUIERE LOGIN
                .anyRequest().authenticated()
            )

            .exceptionHandling(ex -> ex

                .authenticationEntryPoint(
                    (request, response, exception) -> {

                        response.setStatus(
                            HttpServletResponse.SC_UNAUTHORIZED
                        );

                        response.setContentType(
                            "application/json;charset=UTF-8"
                        );

                        response.getWriter().write(
                            "{\"status\":401,"
                            + "\"error\":\"No autenticado\","
                            + "\"message\":\"Debes iniciar sesión con un token válido.\"}"
                        );
                    }
                )

                .accessDeniedHandler(
                    (request, response, exception) -> {

                        response.setStatus(
                            HttpServletResponse.SC_FORBIDDEN
                        );

                        response.setContentType(
                            "application/json;charset=UTF-8"
                        );

                        response.getWriter().write(
                            "{\"status\":403,"
                            + "\"error\":\"Acceso denegado\","
                            + "\"message\":\"No tienes permisos para realizar esta acción.\"}"
                        );
                    }
                )
            )

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}
