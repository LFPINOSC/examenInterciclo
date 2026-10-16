package com.ucacue.backend.security;

import com.ucacue.backend.model.Rol;
import com.ucacue.backend.model.Usuario;
import com.ucacue.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Si no existe ningún usuario con el username "admin", lo creamos automáticamente
        if (usuarioRepository.findByUsername("admin").isEmpty()) {
            Usuario admin = new Usuario();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("201006")); // Contraseña cifrada por defecto
            admin.setRol(Rol.ROLE_ADMIN);
            
            usuarioRepository.save(admin);
            System.out.println(">> ¡Usuario ADMIN creado por defecto! (User: admin / Pass: 201006)");
        }
    }
}