package com.kevmarca.inventario.controller;

import com.kevmarca.inventario.dto.LoginRequest;
import com.kevmarca.inventario.dto.LoginResponse;
import com.kevmarca.inventario.model.Usuario;
import com.kevmarca.inventario.security.JwtService;
import com.kevmarca.inventario.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioService usuarioService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService,
                          UsuarioService usuarioService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.usuarioService = usuarioService;
    }

    /**
     * POST /api/auth/login
     * Verifica usuario y contraseña (BCrypt). Si son correctos devuelve un token JWT.
     * Si son incorrectos, Spring lanza AuthenticationException -> 401.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.username(), req.password()));

        Usuario u = usuarioService.obtenerPorUsername(req.username());
        String token = jwtService.generarToken(u.getUsername(), u.getRol().name());
        return ResponseEntity.ok(new LoginResponse(token, u.getUsername(), u.getNombre(), u.getRol().name()));
    }

    /** GET /api/auth/perfil -> datos del usuario dueño del token. */
    @GetMapping("/perfil")
    public Usuario perfil(Authentication auth) {
        return usuarioService.obtenerPorUsername(auth.getName());
    }
}
