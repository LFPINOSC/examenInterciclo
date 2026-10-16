package com.universidad.matriculas.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.universidad.matriculas.model.Rol;
import com.universidad.matriculas.model.Usuario;
import com.universidad.matriculas.repository.UsuarioRepository;

/**
 * Crea automáticamente el administrador inicial
 * la primera vez que se ejecuta el sistema.
 */
@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner crearAdministrador(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder
    ) {

        return args -> {

            String correoAdmin =
                    "admin@universidad.edu";

            // Solo se crea si todavía no existe
            if (!usuarioRepository
                    .existsByCorreo(correoAdmin)) {

                Usuario administrador =
                        new Usuario();

                administrador.setNombre(
                        "Administrador"
                );

                administrador.setCorreo(
                        correoAdmin
                );

                administrador.setPassword(
                        passwordEncoder.encode(
                                "Admin123*"
                        )
                );

                administrador.setRol(
                        Rol.ADMIN
                );

                administrador.setActivo(true);

                usuarioRepository.save(
                        administrador
                );

                System.out.println(
                        "Administrador inicial creado correctamente."
                );
            }
        };
    }
}