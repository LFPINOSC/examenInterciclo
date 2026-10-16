package com.jordy.ambulancias.seguridad;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
@Service public class JwtServicio {
 private final SecretKey key;
 public JwtServicio(@Value("${app.jwt.secret}") String secret){if(secret.length()<32)throw new IllegalArgumentException("Configura JWT_SECRET de al menos 32 caracteres"); key=Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));}
 public String generar(String email,String rol){return Jwts.builder().subject(email).claim("rol",rol).issuedAt(new Date()).expiration(new Date(System.currentTimeMillis()+7200000)).signWith(key).compact();}
 public Claims leer(String token){return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();}
}
