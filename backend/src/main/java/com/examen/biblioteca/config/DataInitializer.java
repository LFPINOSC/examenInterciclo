package com.examen.biblioteca.config;

import com.examen.biblioteca.model.Role;
import com.examen.biblioteca.model.User;
import com.examen.biblioteca.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Solo se crean cuentas para poder entrar al sistema.
        // Autores, categorías, libros y préstamos NO se generan automáticamente.
        createUserIfMissing(
                "admin",
                "Administrador Biblioteca",
                "admin@biblioteca.local",
                "Admin123*",
                Role.ADMIN
        );

        createUserIfMissing(
                "lector",
                "Lector de Prueba",
                "lector@biblioteca.local",
                "Lector123*",
                Role.LECTOR
        );
    }

    private void createUserIfMissing(String username,
                                     String fullName,
                                     String email,
                                     String password,
                                     Role role) {
        if (userRepository.existsByUsername(username)) {
            return;
        }

        User user = new User();
        user.setUsername(username);
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setEnabled(true);
        userRepository.save(user);
    }
}
