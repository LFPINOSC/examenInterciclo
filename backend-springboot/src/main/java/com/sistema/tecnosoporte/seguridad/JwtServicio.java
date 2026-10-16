package com.sistema.tecnosoporte.seguridad;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
@Service
public class JwtServicio {
 private final SecretKey clave;
 private final long duracion;
 public JwtServicio(@Value("${app.jwt.secret}") String secreta,@Value("${app.jwt.expiration-ms}") long duracion) {
  if(secreta==null || secreta.getBytes(StandardCharsets.UTF_8).length<32) throw new IllegalStateException("JWT_SECRET debe contener al menos 32 bytes");
  this.clave=Keys.hmacShaKeyFor(secreta.getBytes(StandardCharsets.UTF_8));this.duracion=duracion;
 }
 public String crear(Long id) {
  long ahora=System.currentTimeMillis();
  return Jwts.builder().subject(id.toString()).issuedAt(new Date(ahora)).expiration(new Date(ahora+duracion)).signWith(clave).compact();
 }
 public Long leer(String jwt) throws JwtException {
  return Long.valueOf(Jwts.parser().verifyWith(clave).build().parseSignedClaims(jwt).getPayload().getSubject());
 }
}
