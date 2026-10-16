package com.gestiondocentes.api.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.*;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  @Value("${app.jwt.secret}")
  String secret;

  @Value("${app.jwt.expiration-ms}")
  long exp;

  private SecretKey key() {
    return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
  }

  public String generarToken(String correo, String rol) {
    return Jwts.builder()
        .claims(Map.of("rol", rol))
        .subject(correo)
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + exp))
        .signWith(key())
        .compact();
  }

  public String extraerCorreo(String t) {
    return claims(t).getSubject();
  }

  public boolean esValido(String t) {
    try {
      return claims(t).getExpiration().after(new Date());
    } catch (Exception e) {
      return false;
    }
  }

  private Claims claims(String t) {
    return Jwts.parser().verifyWith(key()).build().parseSignedClaims(t).getPayload();
  }
}
