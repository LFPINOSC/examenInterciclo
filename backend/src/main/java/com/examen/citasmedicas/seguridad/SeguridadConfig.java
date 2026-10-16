
package com.examen.citasmedicas.seguridad;

// ==========================================
// IMPORTACIONES
// ==========================================

// Repositorio de usuarios registrados.
import com.examen.citasmedicas.repositorios.UsuarioRepository;

// Configuracion e inyeccion de Spring.
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// Configuracion de seguridad HTTP.
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

// Autenticacion de usuarios desde PostgreSQL.
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

// Contraseñas cifradas mediante BCrypt.
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

// JWT: firma, validacion y permisos.
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

// Implementacion criptografica para firmar JWT.
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

// Configuracion CORS.
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

// Respuestas HTTP de errores.
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

/**
 * ==========================================
 * SEGURIDAD DEL SISTEMA DE CITAS MEDICAS
 * ==========================================
 *
 * Esta clase configura:
 *
 * 1. Autenticacion de usuarios con PostgreSQL.
 * 2. Contraseñas protegidas mediante BCrypt.
 * 3. Generacion y validacion de tokens JWT.
 * 4. Permisos ADMIN y RECEPCIONISTA.
 * 5. Control de errores HTTP 401 y 403.
 * 6. Acceso a Swagger UI.
 * 7. Comunicacion CORS con Angular.
 *
 * REGLAS DE PERMISOS:
 *
 * ADMIN:
 * - Administra usuarios.
 * - Registra, edita, elimina y consulta medicos.
 * - Gestiona pacientes y citas.
 *
 * RECEPCIONISTA:
 * - Consulta medicos sin modificarlos.
 * - Gestiona pacientes y citas.
 * - No administra usuarios.
 *
 * Los tokens se envian mediante:
 * Authorization: Bearer TOKEN
 */
@Configuration
public class SeguridadConfig {

    // ==========================================
    // 1. CONFIGURAR SEGURIDAD HTTP
    // ==========================================

    /**
     * Define las rutas publicas y protegidas.
     *
     * JWT:
     * Spring Security valida automaticamente
     * la firma y expiracion del token.
     *
     * Los permisos se aplican directamente
     * a los endpoints del backend.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationConverter jwtConverter
    ) throws Exception {

        http
            // Permitir solicitudes desde Angular.
            .cors(Customizer.withDefaults())

            // No utilizamos sesiones con cookies.
            .csrf(csrf -> csrf.disable())

            // La API no almacena sesiones HTTP.
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // ======================================
            // PERMISOS DE ACCESO
            // ======================================
            .authorizeHttpRequests(auth -> auth

                // Permitir solicitudes CORS.
                .requestMatchers(
                    HttpMethod.OPTIONS, "/**"
                ).permitAll()

                // Swagger UI y OpenAPI.
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/v3/api-docs.yaml"
                ).permitAll()

                // El login no requiere token.
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/auth/login"
                ).permitAll()

                // Respuestas de error.
                .requestMatchers("/error").permitAll()

                // ==================================
                // USUARIOS: SOLO ADMIN
                // ==================================

                // Solo ADMIN puede consultar,
                // registrar, modificar y eliminar
                // usuarios del sistema.
                .requestMatchers(
                    "/api/usuarios",
                    "/api/usuarios/**"
                ).hasRole("ADMIN")

                // ==================================
                // MEDICOS: CONSULTAS PERMITIDAS
                // ==================================

                // ADMIN y RECEPCIONISTA pueden
                // consultar la lista de medicos,
                // buscar por ID o especialidad.
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/medicos",
                    "/api/medicos/**"
                ).hasAnyRole(
                    "ADMIN",
                    "RECEPCIONISTA"
                )

                // ==================================
                // MEDICOS: REGISTRAR SOLO ADMIN
                // ==================================

                // POST permite crear medicos.
                // RECEPCIONISTA recibira HTTP 403.
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/medicos",
                    "/api/medicos/**"
                ).hasRole("ADMIN")

                // ==================================
                // MEDICOS: EDITAR SOLO ADMIN
                // ==================================

                // PUT permite actualizar los datos
                // de un medico existente.
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/medicos",
                    "/api/medicos/**"
                ).hasRole("ADMIN")

                // ==================================
                // MEDICOS: ELIMINAR SOLO ADMIN
                // ==================================

                // DELETE permite eliminar medicos.
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/medicos",
                    "/api/medicos/**"
                ).hasRole("ADMIN")

                // ==================================
                // PROTECCION ADICIONAL DE MEDICOS
                // ==================================

                // Cualquier otro metodo HTTP sobre
                // medicos requiere ADMIN.
                .requestMatchers(
                    "/api/medicos",
                    "/api/medicos/**"
                ).hasRole("ADMIN")

                // ==================================
                // LOS DEMAS ENDPOINTS
                // ==================================

                // Se conserva el acceso existente
                // para ADMIN y RECEPCIONISTA
                // en los modulos de pacientes
                // y citas medicas.
                .anyRequest()
                .hasAnyRole(
                    "ADMIN",
                    "RECEPCIONISTA"
                )
            )

            // ======================================
            // ERRORES DE SEGURIDAD
            // ======================================
            .exceptionHandling(ex -> ex

                // HTTP 401: no autenticado.
                .authenticationEntryPoint(
                    (request, response, exception) -> {
                        escribirError(
                            response,
                            HttpServletResponse.SC_UNAUTHORIZED,
                            "No autorizado. Token o credenciales invalidas."
                        );
                    }
                )

                // HTTP 403: no tiene permisos.
                .accessDeniedHandler(
                    (request, response, exception) -> {
                        escribirError(
                            response,
                            HttpServletResponse.SC_FORBIDDEN,
                            "Acceso denegado. No tiene permisos."
                        );
                    }
                )
            )

            // ======================================
            // AUTENTICACION JWT
            // ======================================

            // Valida los tokens Bearer enviados
            // por Angular en las solicitudes.
            .oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwt ->
                    jwt.jwtAuthenticationConverter(
                        jwtConverter
                    )
                )
            )

            // Se conserva HTTP Basic como estaba
            // configurado en tu archivo original.
            .httpBasic(Customizer.withDefaults())

            // No utilizar el formulario de Spring.
            .formLogin(form -> form.disable());

        return http.build();
    }

    // ==========================================
    // 2. RESPUESTAS JSON DE ERRORES
    // ==========================================

    /**
     * Genera respuestas JSON uniformes
     * para los errores 401 y 403.
     *
     * Mantiene el formato del manejador
     * global de excepciones.
     */
    private void escribirError(
            HttpServletResponse response,
            int codigo,
            String mensaje
    ) throws IOException {

        response.setStatus(codigo);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String json = "{"
            + "\"fecha\":\""
            + LocalDateTime.now()
            + "\","
            + "\"status\":"
            + codigo
            + ","
            + "\"mensaje\":\""
            + mensaje
            + "\","
            + "\"errores\":{}"
            + "}";

        response.getWriter().write(json);
    }

    // ==========================================
    // 3. CONTRASEÑAS CON BCRYPT
    // ==========================================

    /**
     * Permite proteger y comprobar
     * contraseñas almacenadas en PostgreSQL.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ==========================================
    // 4. USUARIOS DESDE POSTGRESQL
    // ==========================================

    /**
     * Recupera los usuarios de PostgreSQL
     * para autenticar sus credenciales.
     *
     * Comprueba username, contraseña,
     * rol y estado activo.
     *
     * Se mantiene este metodo para permitir
     * la transicion desde HTTP Basic a JWT.
     */
    @Bean
    public UserDetailsService userDetailsService(
            UsuarioRepository usuarioRepository
    ) {

        return username -> {

            var usuario = usuarioRepository
                .findByUsername(username)
                .orElseThrow(() ->
                    new UsernameNotFoundException(
                        "Credenciales incorrectas"
                    )
                );

            return User.withUsername(
                    usuario.getUsername()
                )
                .password(usuario.getPassword())
                .roles(usuario.getRol())
                .disabled(!usuario.isActivo())
                .build();
        };
    }

    // ==========================================
    // 5. CLAVE SECRETA JWT
    // ==========================================

    /**
     * Obtiene la clave secreta desde
     * la variable de entorno JWT_SECRET.
     *
     * La clave debe estar codificada en Base64
     * y contener al menos 32 bytes aleatorios.
     *
     * No colocamos la clave en el codigo
     * para evitar publicarla en GitHub.
     */
    @Bean
    public SecretKey jwtSecretKey(
            @Value("${JWT_SECRET:}")
            String secretoBase64
    ) {

        if (secretoBase64 == null ||
                secretoBase64.isBlank()) {

            throw new IllegalStateException(
                "Debe configurar la variable JWT_SECRET"
            );
        }

        byte[] bytes;

        try {
            bytes = Base64.getDecoder()
                    .decode(secretoBase64);
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException(
                "JWT_SECRET debe estar en Base64",
                ex
            );
        }

        if (bytes.length < 32) {
            throw new IllegalStateException(
                "JWT_SECRET necesita al menos 32 bytes"
            );
        }

        return new SecretKeySpec(
            bytes,
            "HmacSHA256"
        );
    }

    // ==========================================
    // 6. GENERADOR DE TOKENS JWT
    // ==========================================

    /**
     * Permite generar tokens firmados
     * utilizando el algoritmo HS256.
     *
     * Sera utilizado por AuthController
     * cuando el usuario inicie sesion.
     */
    @Bean
    public JwtEncoder jwtEncoder(
            SecretKey jwtSecretKey
    ) {

        return new NimbusJwtEncoder(
            new ImmutableSecret<>(jwtSecretKey)
        );
    }

    // ==========================================
    // 7. VALIDADOR DE TOKENS JWT
    // ==========================================

    /**
     * Verifica la firma y la expiracion
     * de los tokens recibidos.
     *
     * Si el token es invalido o expiro,
     * Spring Security rechaza la solicitud.
     */
    @Bean
    public JwtDecoder jwtDecoder(
            SecretKey jwtSecretKey
    ) {

        return NimbusJwtDecoder
            .withSecretKey(jwtSecretKey)
            .macAlgorithm(MacAlgorithm.HS256)
            .build();
    }

    // ==========================================
    // 8. CONVERTIR ROLES DEL JWT
    // ==========================================

    /**
     * Recupera el claim "rol" del JWT.
     *
     * Convierte:
     * ADMIN -> ROLE_ADMIN
     * RECEPCIONISTA -> ROLE_RECEPCIONISTA
     *
     * Esto permite aplicar las reglas
     * hasRole() y hasAnyRole().
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {

        JwtAuthenticationConverter converter =
                new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(
            jwt -> {

                String rol = jwt.getClaimAsString("rol");

                if (rol == null ||
                    !List.of("ADMIN", "RECEPCIONISTA")
                        .contains(rol)) {

                    return List.of();
                }

                return List.of(
                    new SimpleGrantedAuthority(
                        "ROLE_" + rol
                    )
                );
            }
        );

        return converter;
    }

    // ==========================================
    // 9. CORS PARA ANGULAR
    // ==========================================

    /**
     * Autoriza solicitudes desde Angular
     * en localhost:4200.
     *
     * Permite utilizar el encabezado
     * Authorization para enviar JWT.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config =
                new CorsConfiguration();

        // Origenes del frontend.
        config.setAllowedOrigins(List.of(
            "http://localhost:4200",
            "http://127.0.0.1:4200"
        ));

        // Metodos HTTP permitidos.
        config.setAllowedMethods(List.of(
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS"
        ));

        // Encabezados que puede enviar Angular.
        config.setAllowedHeaders(List.of(
            "Authorization",
            "Content-Type",
            "Accept"
        ));

        // No utilizamos cookies de sesion.
        config.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
            "/**",
            config
        );

        return source;
    }
}
