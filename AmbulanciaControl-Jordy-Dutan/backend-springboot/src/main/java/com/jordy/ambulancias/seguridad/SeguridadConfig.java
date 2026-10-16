
package com.jordy.ambulancias.seguridad;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SeguridadConfig {

    // Cifrar las contraseñas de los usuarios
    @Bean
    public PasswordEncoder encoder() {
        return new BCryptPasswordEncoder();
    }

    // Permitir la comunicación entre Angular y Spring Boot
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuracion = new CorsConfiguration();

        // Direcciones permitidas del frontend
        configuracion.setAllowedOrigins(List.of(
            "http://localhost:4200",
            "http://127.0.0.1:4200"
        ));

        // Métodos HTTP permitidos
        configuracion.setAllowedMethods(List.of(
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ));

        // Encabezados permitidos
        configuracion.setAllowedHeaders(List.of(
            "Authorization",
            "Content-Type"
        ));

        UrlBasedCorsConfigurationSource origen =
            new UrlBasedCorsConfigurationSource();

        origen.registerCorsConfiguration("/**", configuracion);

        return origen;
    }

    // Configuración de seguridad del sistema
    @Bean
    public SecurityFilterChain filter(
        HttpSecurity http,
        JwtFiltro jwt
    ) throws Exception {

        return http

            // Desactivar CSRF para esta API REST con JWT
            .csrf(csrf -> csrf.disable())

            // Activar CORS usando la configuración definida
            .cors(cors -> cors.configurationSource(
                corsConfigurationSource()
            ))

            // La autenticación no utiliza sesión del servidor
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // Permisos de acceso
            .authorizeHttpRequests(auth -> auth

                // Inicio de sesión y registro públicos
                .requestMatchers(
                    "/api/auth/login",
                    "/api/auth/registro",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**"
                ).permitAll()

                // Solo ADMIN puede gestionar recursos y asignaciones
                .requestMatchers(
                    "/api/ambulancias/**",
                    "/api/conductores/**",
                    "/api/asignaciones/**"
                ).hasRole("ADMIN")

                // Usuarios autenticados pueden acceder a solicitudes
                .requestMatchers(
                    "/api/solicitudes/**"
                ).authenticated()

                // Los demás endpoints requieren autenticación
                .anyRequest().authenticated()
            )

            // Verificar el token JWT
            .addFilterBefore(
                jwt,
                UsernamePasswordAuthenticationFilter.class
            )

            .build();
    }
}
