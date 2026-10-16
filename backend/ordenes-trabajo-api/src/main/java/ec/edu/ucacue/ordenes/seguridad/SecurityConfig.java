package ec.edu.ucacue.ordenes.seguridad;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Reglas de acceso (se evaluan de arriba hacia abajo; gana la primera que coincide).
 *
 * | Recurso                              | Publico | TECNICO | ADMIN |
 * |--------------------------------------|---------|---------|-------|
 * | POST /api/auth/login                 |   si    |   si    |  si   |
 * | /api/ordenes (ver, estado, tareas)   |   no    |   si*   |  si   |
 * | /api/tecnicos, /api/resumen          |   no    |   si    |  si   |
 * | clientes, equipos, usuarios          |   no    |   no    |  si   |
 * | crear/editar/eliminar ordenes        |   no    |   no    |  si   |
 *
 * (*) El tecnico solo accede a las ordenes que tiene asignadas; eso lo valida OrdenService.
 */
@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final JsonAuthenticationEntryPoint entryPoint;
    private final JsonAccessDeniedHandler accessDeniedHandler;
    private final List<String> origenesPermitidos;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter,
                          JsonAuthenticationEntryPoint entryPoint,
                          JsonAccessDeniedHandler accessDeniedHandler,
                          @Value("${app.cors.origenes}") List<String> origenesPermitidos) {
        this.jwtFilter = jwtFilter;
        this.entryPoint = entryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
        this.origenesPermitidos = origenesPermitidos;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // API REST sin cookies: CSRF no aplica porque el token viaja en una cabecera.
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                // Stateless: el servidor no guarda sesiones, cada peticion trae su JWT.
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(entryPoint)        // 401
                        .accessDeniedHandler(accessDeniedHandler))   // 403
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/error").permitAll()
                        // Preflight de CORS: el navegador lo envia sin token antes de cada peticion.
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()

                        // ---- Solo ADMIN ----
                        .requestMatchers("/api/admin/**", "/api/clientes/**", "/api/equipos/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/ordenes").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/ordenes/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/ordenes/*").hasRole("ADMIN")

                        // ---- ADMIN o TECNICO (el servicio limita al tecnico a sus ordenes) ----
                        .requestMatchers("/api/ordenes/**", "/api/tareas/**", "/api/tecnicos", "/api/resumen",
                                "/api/auth/perfil").hasAnyRole("ADMIN", "TECNICO")

                        .anyRequest().authenticated())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(origenesPermitidos);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    /** El filtro JWT es un @Component; se desactiva su registro global para que corra solo en Spring Security. */
    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> desactivarRegistroGlobal(JwtAuthenticationFilter filtro) {
        FilterRegistrationBean<JwtAuthenticationFilter> registro = new FilterRegistrationBean<>(filtro);
        registro.setEnabled(false);
        return registro;
    }

    /** BCrypt: hash lento y con "sal" aleatoria; dos contrasenas iguales producen hashes distintos. */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /** Bean vacio: evita que Spring Boot cree un usuario "user" con contrasena aleatoria. */
    @Bean
    public UserDetailsService userDetailsService() {
        return new InMemoryUserDetailsManager();
    }
}
