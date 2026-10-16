package com.universidad.matriculas.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

/**
 * Servicio encargado de generar, leer y validar
 * tokens JWT.
 */
@Service
public class JwtService {

    // Clave configurada en application.properties
    @Value("${app.jwt.secret}")
    private String secret;

    // Tiempo de vida del token
    @Value("${app.jwt.expiration}")
    private long expiration;

    /**
     * Genera un JWT utilizando el correo del usuario.
     */
    public String generarToken(UserDetails usuario) {

        return Jwts.builder()
                .subject(usuario.getUsername())
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + expiration
                        )
                )
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Obtiene el correo almacenado en el token.
     */
    public String obtenerCorreo(String token) {

        return obtenerClaims(token)
                .getSubject();
    }

    /**
     * Verifica que el token corresponda al usuario
     * y que no haya expirado.
     */
    public boolean tokenValido(
            String token,
            UserDetails usuario
    ) {

        String correo =
                obtenerCorreo(token);

        return correo.equals(usuario.getUsername())
                && !tokenExpirado(token);
    }

    /**
     * Comprueba si el token ya expiró.
     */
    private boolean tokenExpirado(String token) {

        return obtenerClaims(token)
                .getExpiration()
                .before(new Date());
    }

    /**
     * Lee los datos internos del token.
     */
    private Claims obtenerClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Convierte la clave Base64 del properties
     * en una clave válida para firmar JWT.
     */
    private SecretKey getSigningKey() {

        byte[] keyBytes =
                Decoders.BASE64.decode(secret);

        return Keys.hmacShaKeyFor(keyBytes);
    }
}