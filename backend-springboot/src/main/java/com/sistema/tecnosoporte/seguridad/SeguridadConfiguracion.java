package com.sistema.tecnosoporte.seguridad;
import java.util.List;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;
@EnableMethodSecurity
@Configuration
public class SeguridadConfiguracion {
 @Bean PasswordEncoder encoder() {return new BCryptPasswordEncoder();}
 @Bean CorsConfigurationSource corsSource() {
  CorsConfiguration c=new CorsConfiguration();
  c.setAllowedOrigins(List.of("http://localhost:4200","http://127.0.0.1:4200"));
  c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
  c.setAllowedHeaders(List.of("Authorization","Content-Type"));
  c.setExposedHeaders(List.of("Location"));
  c.setAllowCredentials(false);
  UrlBasedCorsConfigurationSource src=new UrlBasedCorsConfigurationSource();src.registerCorsConfiguration("/**",c);return src;
 }
 @Bean SecurityFilterChain filtro(HttpSecurity http,FiltroJwt filtro) throws Exception {
  http.csrf(csrf->csrf.disable()).cors(Customizer.withDefaults())
   .sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
   .authorizeHttpRequests(a->a
    .requestMatchers(HttpMethod.OPTIONS,"/**").permitAll()
    .requestMatchers("/api/auth/registro","/api/auth/login","/swagger-ui.html","/swagger-ui/**","/v3/api-docs/**","/error").permitAll()
    .anyRequest().authenticated())
   .exceptionHandling(ex->ex
    .authenticationEntryPoint((req,res,error)->respuesta(res,401,"Token ausente, invalido o caducado"))
    .accessDeniedHandler((req,res,error)->respuesta(res,403,"No tienes permiso para esta operacion")))
   .addFilterBefore(filtro,UsernamePasswordAuthenticationFilter.class);
  return http.build();
 }
 private void respuesta(jakarta.servlet.http.HttpServletResponse r,int codigo,String msg) throws java.io.IOException {
  r.setStatus(codigo);r.setContentType("application/json;charset=UTF-8");
  r.getWriter().write("{\"codigo\":"+codigo+",\"mensaje\":\""+msg+"\"}");
 }
}
