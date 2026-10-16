package com.kevmarca.inventario.config;

import com.kevmarca.inventario.model.Rol;
import com.kevmarca.inventario.model.Usuario;
import com.kevmarca.inventario.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Al arrancar, crea los usuarios iniciales si no existen.
 * Se hace aquí (y no en el SQL) porque la contraseña debe guardarse cifrada con BCrypt.
 *   admin    / admin123     -> rol ADMIN
 *   empleado / empleado123  -> rol EMPLEADO
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        crearSiNoExiste("Administrador del sistema", "admin", "admin123", Rol.ADMIN);
        crearSiNoExiste("Empleado de bodega", "empleado", "empleado123", Rol.EMPLEADO);
    }

    private void crearSiNoExiste(String nombre, String username, String clave, Rol rol) {
        if (!usuarioRepository.existsByUsername(username)) {
            Usuario u = new Usuario();
            u.setNombre(nombre);
            u.setUsername(username);
            u.setPassword(passwordEncoder.encode(clave));
            u.setRol(rol);
            u.setActivo(true);
            usuarioRepository.save(u);
        }
    }
}
