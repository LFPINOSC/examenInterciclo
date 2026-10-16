package com.danny.reservas.security;

import com.danny.reservas.service.AuthService;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtFilter extends OncePerRequestFilter {
  private final JwtService jwt;
  private final AuthService auth;

  public JwtFilter(JwtService jwt, AuthService auth) {
    this.jwt = jwt;
    this.auth = auth;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest r) {
    return r.getMethod().equals("OPTIONS")
        || List.of("/api/auth/login", "/api/auth/registro", "/api/health")
            .contains(r.getServletPath());
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {
    String h = req.getHeader("Authorization");
    if (h != null && h.startsWith("Bearer ")) {
      try {
        var j = jwt.leer(h.substring(7));
        var a =
            auth.actual(Long.parseLong(j.getSubject()), ((Number) j.getClaim("ver")).intValue());
        SecurityContextHolder.getContext()
            .setAuthentication(
                new UsernamePasswordAuthenticationToken(
                    a, null, List.of(new SimpleGrantedAuthority("ROLE_" + a.rol()))));
      } catch (Exception e) {
        res.setStatus(401);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter()
            .write("{\"error\":\"Sesión vencida o no válida. Inicia sesión otra vez.\"}");
        return;
      }
    }
    chain.doFilter(req, res);
  }
}
