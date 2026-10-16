package com.universidad.matriculas.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.universidad.matriculas.dto.AuthResponse;
import com.universidad.matriculas.dto.LoginRequest;
import com.universidad.matriculas.dto.RegistroRequest;
import com.universidad.matriculas.model.Rol;
import com.universidad.matriculas.model.Usuario;
import com.universidad.matriculas.repository.UsuarioRepository;
import com.universidad.matriculas.security.JwtService;

/**
 * Servicio encargado del registro y login de usuarios.
 */
@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            CustomUserDetailsService userDetailsService,
            JwtService jwtService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
    }

    /**
     * Registra un nuevo usuario.
     *
     * Todo registro publico se crea automaticamente
     * con rol ESTUDIANTE.
     */
    public AuthResponse registrar(RegistroRequest request) {

        // Evita correos duplicados
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new IllegalArgumentException(
                    "El correo ya se encuentra registrado."
            );
        }

        Usuario usuario = new Usuario();

        usuario.setNombre(request.getNombre());
        usuario.setCorreo(request.getCorreo());

        // La contraseña nunca se guarda como texto plano
        usuario.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        // Nadie puede registrarse como ADMIN desde el frontend
        usuario.setRol(Rol.ESTUDIANTE);

        usuario.setActivo(true);

        Usuario guardado =
                usuarioRepository.save(usuario);

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(
                        guardado.getCorreo()
                );

        String token =
                jwtService.generarToken(userDetails);

        return crearRespuesta(
                guardado,
                token
        );
    }

    /**
     * Comprueba correo y contraseña.
     * Si son correctos genera un JWT.
     */
    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken
                        .unauthenticated(
                                request.getCorreo(),
                                request.getPassword()
                        )
        );

        Usuario usuario =
                usuarioRepository
                        .findByCorreo(request.getCorreo())
                        .orElseThrow();

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(
                        usuario.getCorreo()
                );

        String token =
                jwtService.generarToken(userDetails);

        return crearRespuesta(
                usuario,
                token
        );
    }

    /**
     * Construye la respuesta que recibirá Angular.
     */
    private AuthResponse crearRespuesta(
            Usuario usuario,
            String token
    ) {

        return new AuthResponse(
                token,
                usuario.getId(),
                usuario.getNombre(),
                usuario.getCorreo(),
                usuario.getRol().name()
        );
    }
}