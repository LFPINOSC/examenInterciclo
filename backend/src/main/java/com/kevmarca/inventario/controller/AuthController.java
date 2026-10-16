package com.kevmarca.inventario.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kevmarca.inventario.dto.LoginRequest;
import com.kevmarca.inventario.dto.LoginResponse;
import com.kevmarca.inventario.model.Usuario;
import com.kevmarca.inventario.security.JwtService;
import com.kevmarca.inventario.service.UsuarioService;

import jakarta.validation.Valid;

// 📌 CONTROLLER = recibe peticiones HTTP. Aquí: login y perfil
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

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        // 1) Spring compara la contraseña con el hash BCrypt (si falla -> 401)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.username(), req.password()));

        Usuario u = usuarioService.obtenerPorUsername(req.username());
        // 2) Si es correcta, se genera el token JWT que el frontend guardará
        String token = jwtService.generarToken(u.getUsername(), u.getRol().name());
        return ResponseEntity.ok(new LoginResponse(token, u.getUsername(), u.getNombre(), u.getRol().name()));
    }

    /** GET /api/auth/perfil -> datos del usuario dueño del token. */
    @GetMapping("/perfil")
    public Usuario perfil(Authentication auth) {
        return usuarioService.obtenerPorUsername(auth.getName());
    }
}
