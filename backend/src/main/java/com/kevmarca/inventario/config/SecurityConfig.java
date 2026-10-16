package com.kevmarca.inventario.config;

import java.util.List;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.kevmarca.inventario.security.JwtAuthFilter;


// 📌 EL PORTERO: decide quién puede usar cada ruta de la API
@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF afecta a cookies; usamos token JWT en la cabecera, por eso se desactiva
            .csrf(AbstractHttpConfigurer::disable)
            // CORS: permite que el frontend (5173) llame al backend (8080)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // STATELESS: el servidor no guarda sesiones, cada petición trae su token
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Reglas de arriba hacia abajo: se aplica la PRIMERA que coincide
            .authorizeHttpRequests(auth -> auth
                // Público
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/login").permitAll()

                // Solo administrador
                .requestMatchers("/api/usuarios/**").hasRole("ADMIN")
                .requestMatchers("/api/reportes/**").hasRole("ADMIN")   // ventas y ganancias
                .requestMatchers(HttpMethod.POST,   "/api/categorias/**", "/api/proveedores/**", "/api/productos/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/categorias/**", "/api/proveedores/**", "/api/productos/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/categorias/**", "/api/proveedores/**", "/api/productos/**",
                                                    "/api/movimientos/**").hasRole("ADMIN")

                // Cualquier usuario autenticado (ADMIN o EMPLEADO)
                // Todo lo demás (GET, registrar movimientos): ADMIN o EMPLEADO con token
                .anyRequest().authenticated()
            )
            // 401 = no sé quién eres | 403 = sé quién eres pero no tienes permiso
            .exceptionHandling(e -> e
                .authenticationEntryPoint((req, res, ex) ->
                        escribirError(res, 401, "Debe iniciar sesión o su sesión ha expirado"))
                .accessDeniedHandler((req, res, ex) ->
                        escribirError(res, 403, "No tiene permisos para realizar esta acción"))
            )
            // Primero se lee el token (JwtAuthFilter) y luego se revisan los permisos
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private static void escribirError(jakarta.servlet.http.HttpServletResponse res, int estado, String mensaje)
            throws java.io.IOException {
        res.setStatus(estado);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write("{\"estado\":" + estado + ",\"mensaje\":\"" + mensaje + "\"}");
    }

    /** Evita que Spring Boot registre el filtro JWT dos veces (solo debe ir dentro de Spring Security). */
    @Bean
    public FilterRegistrationBean<JwtAuthFilter> desactivarRegistroAutomatico(JwtAuthFilter filtro) {
        FilterRegistrationBean<JwtAuthFilter> registro = new FilterRegistrationBean<>(filtro);
        registro.setEnabled(false);
        return registro;
    }

    /** Las contraseñas se guardan cifradas con BCrypt (hash con sal, no reversible). */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /** Permite que el frontend (Vite en el puerto 5173) consuma la API. */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://127.0.0.1:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
