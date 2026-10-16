package com.gestiondocentes.api.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
  private final JwtService jwt;
  private final CustomUserDetailsService users;

  public JwtAuthenticationFilter(JwtService j, CustomUserDetailsService u) {
    jwt = j;
    users = u;
  }

  protected void doFilterInternal(
      HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {
    String a = req.getHeader("Authorization");
    if (a != null && a.startsWith("Bearer ")) {
      String t = a.substring(7);
      if (jwt.esValido(t) && SecurityContextHolder.getContext().getAuthentication() == null) {
        UserDetails u = users.loadUserByUsername(jwt.extraerCorreo(t));
        SecurityContextHolder.getContext()
            .setAuthentication(
                new UsernamePasswordAuthenticationToken(u, null, u.getAuthorities()));
      }
    }
    chain.doFilter(req, res);
  }
}
