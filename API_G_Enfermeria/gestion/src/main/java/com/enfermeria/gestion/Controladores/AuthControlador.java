
package com.enfermeria.gestion.Controladores;

import com.enfermeria.gestion.DTO.LoginRequest;
import com.enfermeria.gestion.DTO.LoginResponse;
import com.enfermeria.gestion.Entidades.Usuario;
import com.enfermeria.gestion.Repositorios.UsuarioRepositorio;
import com.enfermeria.gestion.Seguridad.JwtService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;

@RestController
@RequestMapping("/api/auth")
public class AuthControlador {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepositorio usuarios;
    private final JwtService jwtService;

    public AuthControlador(
            AuthenticationManager authenticationManager,
            UsuarioRepositorio usuarios,
            JwtService jwtService) {

        this.authenticationManager = authenticationManager;
        this.usuarios = usuarios;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest datos) {

        String correo = datos.correo().trim()
            .toLowerCase(Locale.ROOT);

        Authentication autenticacion =
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    correo,
                    datos.password()
                )
            );

        UserDetails principal =
            (UserDetails) autenticacion.getPrincipal();

        Usuario usuario = usuarios
            .findByCorreoIgnoreCase(principal.getUsername())
            .orElseThrow(() ->
                new BadCredentialsException(
                    "Credenciales incorrectas"));

        String token = jwtService.generarToken(principal);

        return ResponseEntity.ok(new LoginResponse(
            token,
            "Bearer",
            usuario.getId(),
            usuario.getNombre(),
            usuario.getCorreo(),
            usuario.getRol()
        ));
    }
}
