package com.andres.odontologia_api.controlador;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;

import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.andres.odontologia_api.dto.LoginDTO;
import com.andres.odontologia_api.dto.RegistroDTO;
import com.andres.odontologia_api.dto.TokenRespuestaDTO;

import com.andres.odontologia_api.modelo.Usuario;
import com.andres.odontologia_api.repositorio.UsuarioRepositorio;

import jakarta.validation.Valid;

// Controlador encargado del registro e inicio de sesion.
@RestController
@RequestMapping("/api/auth")
public class AuthControlador {

    // Repositorio para consultar y guardar usuarios.
    private final UsuarioRepositorio usuarioRepositorio;

    // Servicio para cifrar y verificar contraseñas.
    private final PasswordEncoder passwordEncoder;

    // Componente encargado de generar tokens JWT.
    private final JwtEncoder jwtEncoder;

    // Constructor con inyeccion de dependencias.
    public AuthControlador(
            UsuarioRepositorio usuarioRepositorio,
            PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder) {

        this.usuarioRepositorio = usuarioRepositorio;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
    }

    // ==========================================
    // REGISTRO DE USUARIOS
    // POST /api/auth/registro
    // ==========================================

    @PostMapping("/registro")
    @Transactional
    public ResponseEntity<TokenRespuestaDTO> registrar(
            @Valid @RequestBody RegistroDTO datos) {

        // Convertir el nombre de usuario a minusculas.
        String username = datos.username()
                .trim()
                .toLowerCase(Locale.ROOT);

        // Verificar si el usuario ya existe.
        if (usuarioRepositorio.existsByUsername(username)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El nombre de usuario ya esta registrado"
            );
        }

        // Crear una nueva entidad Usuario.
        Usuario usuario = new Usuario();

        usuario.setUsername(username);

        // Cifrar la contraseña antes de almacenarla.
        usuario.setPassword(
                passwordEncoder.encode(datos.password())
        );

        // Los usuarios nuevos reciben el rol USER.
        // Nadie puede registrarse directamente como ADMIN.
        usuario.setRol("USER");

        // Activar la cuenta.
        usuario.setActivo(true);

        // Guardar el usuario en PostgreSQL.
        Usuario guardado = usuarioRepositorio.save(usuario);

        // Generar token JWT.
        String token = generarToken(guardado);

        // Responder sin exponer la contraseña.
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new TokenRespuestaDTO(
                        token,
                        "Bearer",
                        guardado.getUsername(),
                        guardado.getRol()
                ));
    }

    // ==========================================
    // INICIO DE SESION
    // POST /api/auth/login
    // ==========================================

    @PostMapping("/login")
    public TokenRespuestaDTO login(
            @Valid @RequestBody LoginDTO datos) {

        // Normalizar el nombre del usuario.
        String username = datos.username()
                .trim()
                .toLowerCase(Locale.ROOT);

        // Buscar usuario en PostgreSQL.
        Usuario usuario = usuarioRepositorio
                .findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Usuario o contraseña incorrectos"
                ));

        // Verificar que la cuenta se encuentre activa.
        if (!usuario.isActivo()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Usuario o contraseña incorrectos"
            );
        }

        // Verificar la contraseña utilizando BCrypt.
        if (!passwordEncoder.matches(
                datos.password(),
                usuario.getPassword())) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Usuario o contraseña incorrectos"
            );
        }

        // Generar un token para el usuario autenticado.
        String token = generarToken(usuario);

        return new TokenRespuestaDTO(
                token,
                "Bearer",
                usuario.getUsername(),
                usuario.getRol()
        );
    }

    // ==========================================
    // GENERACION DEL TOKEN JWT
    // ==========================================

    private String generarToken(Usuario usuario) {

        // Fecha actual.
        Instant ahora = Instant.now();

        // Informacion y tiempo de validez del token.
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("odontologia-api")
                .issuedAt(ahora)
                .expiresAt(ahora.plusSeconds(1800))
                .subject(usuario.getUsername())
                .claim("roles", List.of(usuario.getRol()))
                .build();

        // Algoritmo para firmar el token.
        JwsHeader header = JwsHeader
                .with(MacAlgorithm.HS256)
                .build();

        // Generar y devolver el token firmado.
        return jwtEncoder.encode(
                JwtEncoderParameters.from(header, claims)
        ).getTokenValue();
    }
}