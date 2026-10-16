package com.ucacue.backend.controller;

import com.ucacue.backend.model.Rol;
import com.ucacue.backend.model.Usuario;
import com.ucacue.backend.repository.UsuarioRepository;
import com.ucacue.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // ==========================================
    // 1. ENDPOINT DE LOGIN (/api/auth/login)
    // ==========================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario usuario) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(usuario.getUsername(), usuario.getPassword())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtil.generarToken(userDetails);
            
            // Obtenemos el rol del usuario desde la base de datos
            Usuario userEntity = usuarioRepository.findByUsername(userDetails.getUsername()).orElseThrow();
            String rol = String.valueOf(userEntity.getRol());

            // Retornamos el token y el rol para que Angular decida a qué dashboard redirigir
            return ResponseEntity.ok(new AuthResponse(token, rol));
            
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Error: Usuario o contraseña incorrectos.");
        }
    }

    // ==========================================
    // 2. ENDPOINT DE REGISTRO (/api/auth/register)
    // ==========================================
    @PostMapping("/register")
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario usuario) {
        // Valida si el nombre de usuario ya existe
        if (usuarioRepository.findByUsername(usuario.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: El nombre de usuario ya está en uso.");
        }
        
        // Encripta la contraseña
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        
        // LÓGICA AUTOMÁTICA DE ROLES:
        // Si la base de datos está totalmente vacía, el primer usuario es ADMIN.
        // De lo contrario, cualquier registro posterior se convierte en CLIENTE.
        if (usuarioRepository.count() == 0) {
            usuario.setRol(Rol.ROLE_ADMIN);
        } else {
            usuario.setRol(Rol.ROLE_CLIENTE);
        }
        
        Usuario nuevoUsuario = usuarioRepository.save(usuario);
        return ResponseEntity.ok(nuevoUsuario);
    }
}

class AuthResponse {
    private String token;
    private String rol;

    public AuthResponse(String token, String rol) {
        this.token = token;
        this.rol = rol;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }
}