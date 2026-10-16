
package com.enfermeria.gestion.Seguridad;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey clave;
    private final long expiracion;

    public JwtService(
            @Value("${app.jwt.secret}") String secreto,
            @Value("${app.jwt.expiration-ms}") long expiracion) {

        byte[] bytes = Decoders.BASE64.decode(secreto);

        if (bytes.length < 32) {
            throw new IllegalArgumentException(
                "JWT_SECRET debe tener al menos 256 bits");
        }

        this.clave = Keys.hmacShaKeyFor(bytes);
        this.expiracion = expiracion;
    }

    public String generarToken(UserDetails usuario) {

        Date ahora = new Date();
        Date vencimiento = new Date(
            ahora.getTime() + expiracion);

        return Jwts.builder()
            .subject(usuario.getUsername())
            .issuedAt(ahora)
            .expiration(vencimiento)
            .signWith(clave)
            .compact();
    }

    public String extraerCorreo(String token) {

        return Jwts.parser()
            .verifyWith(clave)
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();
    }

    public boolean validarToken(
            String token, UserDetails usuario) {

        try {
            String correo = extraerCorreo(token);

            return correo.equalsIgnoreCase(usuario.getUsername())
                && usuario.isEnabled();

        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }
}
