package com.andres.odontologia_api.configuracion;

import java.util.Base64;
import java.util.List;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

import org.springframework.security.web.SecurityFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

// Configuracion principal de seguridad de la API
@Configuration
public class SeguridadConfig {

    // Cifrar y comprobar las contrasenas con BCrypt
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Obtener la clave secreta desde las variables de entorno
    @Bean
    public SecretKey jwtSecretKey(
            @Value("${app.jwt.secret-base64}") String secretBase64) {

        byte[] clave = Base64.getDecoder().decode(secretBase64);

        // HS256 necesita una clave de al menos 256 bits
        if (clave.length < 32) {
            throw new IllegalArgumentException(
                "La clave JWT debe tener al menos 32 bytes"
            );
        }

        return new SecretKeySpec(clave, "HmacSHA256");
    }

    // Crear los tokens JWT firmados
    @Bean
    public JwtEncoder jwtEncoder(SecretKey jwtSecretKey) {
        return NimbusJwtEncoder
                .withSecretKey(jwtSecretKey)
                .algorithm(MacAlgorithm.HS256)
                .build();
    }

    // Validar los tokens JWT recibidos
    @Bean
    public JwtDecoder jwtDecoder(SecretKey jwtSecretKey) {

        NimbusJwtDecoder decoder = NimbusJwtDecoder
                .withSecretKey(jwtSecretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();

        // Verificar expiracion y emisor del token
        decoder.setJwtValidator(
                JwtValidators.createDefaultWithIssuer("odontologia-api")
        );

        return decoder;
    }

    // Convertir los roles del JWT en permisos
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {

        JwtGrantedAuthoritiesConverter roles =
                new JwtGrantedAuthoritiesConverter();

        // Leer el campo "roles" del token
        roles.setAuthoritiesClaimName("roles");
        roles.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter converter =
                new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(roles);

        return converter;
    }

    // Definir que rutas puede utilizar cada rol
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationConverter converter) throws Exception {

        http
            // API REST con autenticacion Bearer
            .csrf(csrf -> csrf.disable())

            // Permitir solicitudes desde Angular
            .cors(Customizer.withDefaults())

            // No almacenar sesiones en el servidor
            .sessionManagement(session -> session
                .sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // Permisos por endpoint
            .authorizeHttpRequests(auth -> auth

                // Registro y login publicos
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/auth/registro",
                    "/api/auth/login"
                ).permitAll()

                // Permitir respuestas de error
                .requestMatchers("/error").permitAll()

                // Ambos roles pueden consultar catalogos
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/servicios/**",
                    "/api/odontologos/**"
                ).hasAnyRole("ADMIN", "USER")

                // Solo ADMIN gestiona pacientes, citas y pagos
                .requestMatchers("/api/**").hasRole("ADMIN")

                // Proteger las demas rutas
                .anyRequest().denyAll()
            )

            // Desactivar login basico y formulario por defecto
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable())

            // Activar autenticacion mediante JWT
            .oauth2ResourceServer(oauth -> oauth
                .jwt(jwt -> jwt
                    .jwtAuthenticationConverter(converter)
                )
            );

        return http.build();
    }

    // Configurar CORS para conectar Angular con Spring Boot
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        // Frontend Angular
        config.setAllowedOrigins(
                List.of("http://localhost:4200")
        );

        // Metodos HTTP permitidos
        config.setAllowedMethods(
                List.of(
                    "GET",
                    "POST",
                    "PUT",
                    "PATCH",
                    "DELETE",
                    "OPTIONS"
                )
        );

        // Cabeceras que Angular puede enviar
        config.setAllowedHeaders(
                List.of("Authorization", "Content-Type")
        );

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}