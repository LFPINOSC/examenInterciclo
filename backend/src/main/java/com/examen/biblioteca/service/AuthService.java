package com.examen.biblioteca.service;

import com.examen.biblioteca.dto.*;
import com.examen.biblioteca.exception.BusinessException;
import com.examen.biblioteca.model.Role;
import com.examen.biblioteca.model.User;
import com.examen.biblioteca.repository.UserRepository;
import com.examen.biblioteca.security.CustomUserDetailsService;
import com.examen.biblioteca.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       CustomUserDetailsService userDetailsService,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new BusinessException("El nombre de usuario ya existe");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("El correo electrónico ya está registrado");
        }

        User user = new User();
        user.setUsername(request.username().trim());
        user.setFullName(request.fullName().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.LECTOR);
        user.setEnabled(true);
        user = userRepository.save(user);

        UserDetails details = userDetailsService.loadUserByUsername(user.getUsername());
        return response(user, jwtService.generateToken(details));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BusinessException("Credenciales incorrectas"));
        UserDetails details = userDetailsService.loadUserByUsername(user.getUsername());
        return response(user, jwtService.generateToken(details));
    }

    private AuthResponse response(User user, String token) {
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getFullName(),
                user.getEmail(), user.getRole());
    }
}
