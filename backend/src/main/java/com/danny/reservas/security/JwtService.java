package com.danny.reservas.security;

import com.danny.reservas.model.Actor;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final JwtEncoder encoder;
  private final JwtDecoder decoder;

  public JwtService(@Value("${app.jwt-secret}") String secret) {
    if (secret.getBytes(StandardCharsets.UTF_8).length < 32)
      throw new IllegalStateException(
          "Configura una clave JWT de al menos 32 bytes con CONFIGURAR.cmd");
    var key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    encoder = new NimbusJwtEncoder(new ImmutableSecret<>(key));
    var dec = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
    dec.setJwtValidator(JwtValidators.createDefaultWithIssuer("reservas-hoteleras"));
    decoder = dec;
  }

  public String emitir(Actor a) {
    var now = Instant.now();
    var claims =
        JwtClaimsSet.builder()
            .issuer("reservas-hoteleras")
            .subject(Long.toString(a.id()))
            .issuedAt(now)
            .expiresAt(now.plusSeconds(3600))
            .claim("ver", a.version())
            .build();
    return encoder
        .encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
        .getTokenValue();
  }

  public Jwt leer(String token) {
    return decoder.decode(token);
  }
}
