package ec.edu.ucacue.ordenes.seguridad;

import ec.edu.ucacue.ordenes.entidad.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Genera y valida los JWT. El token va firmado con HMAC-SHA256: si alguien modifica
 * el contenido (por ejemplo cambia su rol a ADMIN), la firma deja de coincidir y se rechaza.
 */
@Service
public class JwtService {

    private final SecretKey clave;
    private final long expiracionMinutos;

    public JwtService(@Value("${app.jwt.secreto}") String secreto,
                      @Value("${app.jwt.expiracion-minutos}") long expiracionMinutos) {
        this.clave = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secreto));
        this.expiracionMinutos = expiracionMinutos;
    }

    public String generarToken(Usuario usuario) {
        Date ahora = new Date();
        Date expira = new Date(ahora.getTime() + expiracionMinutos * 60_000);
        return Jwts.builder()
                .subject(usuario.getUsername())
                .claim("id", usuario.getId())
                .claim("rol", usuario.getRol().name())
                .issuer("ordenes-trabajo-api")
                .issuedAt(ahora)
                .expiration(expira)
                .signWith(clave, Jwts.SIG.HS256)
                .compact();
    }

    /** Verifica firma y expiracion. Lanza JwtException si el token es invalido o expiro. */
    public Claims validar(String token) {
        return Jwts.parser()
                .verifyWith(clave)
                .requireIssuer("ordenes-trabajo-api")
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public LocalDateTime calcularExpiracion() {
        return LocalDateTime.now(ZoneId.systemDefault()).plusMinutes(expiracionMinutos);
    }
}
