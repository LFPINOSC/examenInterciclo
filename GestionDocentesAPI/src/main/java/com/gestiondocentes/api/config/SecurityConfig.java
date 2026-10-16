package com.gestiondocentes.api.config;

import com.gestiondocentes.api.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

  private final JwtAuthenticationFilter jwt;

  public SecurityConfig(JwtAuthenticationFilter jwt) {
    this.jwt = jwt;
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http.csrf(csrf -> csrf.disable())
        .cors(cors -> {})
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers(
                        "/api/auth/**", "/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**")
                    .permitAll()
                    .requestMatchers("/api/admin/**")
                    .hasRole("ADMIN")
                    .requestMatchers(
                        HttpMethod.GET,
                        "/api/docentes/**",
                        "/api/asignaturas/**",
                        "/api/carreras/**",
                        "/api/periodos/**",
                        "/api/asignaciones/**")
                    .hasAnyRole("USER", "ADMIN")
                    .requestMatchers(
                        "/api/docentes/**",
                        "/api/asignaturas/**",
                        "/api/carreras/**",
                        "/api/periodos/**",
                        "/api/asignaciones/**")
                    .hasRole("ADMIN")
                    .anyRequest()
                    .authenticated())
        .addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class)
        .build();
  }
}
