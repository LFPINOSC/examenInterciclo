package com.kevmarca.inventario.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.kevmarca.inventario.model.Rol;
import com.kevmarca.inventario.model.Usuario;
import com.kevmarca.inventario.repository.UsuarioRepository;


// 📌 Se ejecuta UNA vez al arrancar: asegura que exista un admin para poder entrar
@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    // CommandLineRunner -> Spring llama a run() automáticamente al terminar de arrancar
    public void run(String... args) {
        crearSiNoExiste("Administrador del sistema", "admin", "admin123", Rol.ADMIN);
        crearSiNoExiste("Empleado de bodega", "empleado", "empleado123", Rol.EMPLEADO);
    }

    private void crearSiNoExiste(String nombre, String username, String clave, Rol rol) {
        // Solo crea si NO existe (así no se duplica en cada reinicio)
        if (!usuarioRepository.existsByUsername(username)) {
            Usuario u = new Usuario();
            u.setNombre(nombre);
            u.setUsername(username);
            // Nunca se guarda "admin123": se guarda el hash BCrypt
            u.setPassword(passwordEncoder.encode(clave));
            u.setRol(rol);
            u.setActivo(true);
            usuarioRepository.save(u);
        }
    }
}
