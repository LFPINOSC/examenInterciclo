package com.universidad.matriculas.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.universidad.matriculas.dto.AuthResponse;
import com.universidad.matriculas.dto.LoginRequest;
import com.universidad.matriculas.dto.RegistroRequest;
import com.universidad.matriculas.service.AuthService;

/**
 * Controlador público para registro y autenticación.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(
            AuthService authService
    ) {
        this.authService = authService;
    }

    /**
     * Registra un nuevo estudiante.
     *
     * POST /api/auth/registro
     */
    @PostMapping("/registro")
    public ResponseEntity<?> registrar(
            @RequestBody RegistroRequest request
    ) {

        try {

            AuthResponse respuesta =
                    authService.registrar(request);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(respuesta);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "mensaje",
                                    e.getMessage()
                            )
                    );
        }
    }

    /**
     * Inicia sesión.
     *
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        try {

            AuthResponse respuesta =
                    authService.login(request);

            return ResponseEntity.ok(respuesta);

        } catch (AuthenticationException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "mensaje",
                                    "Correo o contraseña incorrectos."
                            )
                    );
        }
    }
}