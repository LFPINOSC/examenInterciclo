
package com.enfermeria.gestion.configuracion;

import com.enfermeria.gestion.Entidades.Rol;
import com.enfermeria.gestion.Entidades.Usuario;
import com.enfermeria.gestion.Repositorios.UsuarioRepositorio;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Locale;

@Configuration
public class AdministradorInicial {

    @Bean
    CommandLineRunner crearAdministrador(
            UsuarioRepositorio usuarios,
            PasswordEncoder encoder,
            @Value("${app.admin.email:}") String correo,
            @Value("${app.admin.password:}") String password) {

        return args -> {

            if (correo.isBlank() || password.isBlank()) {
                return;
            }

            if (password.length() < 12) {
                throw new IllegalStateException(
                    "ADMIN_PASSWORD debe tener al menos 12 caracteres");
            }

            String correoNormalizado =
                correo.trim().toLowerCase(Locale.ROOT);

            if (usuarios.existsByCorreoIgnoreCase(correoNormalizado)) {
                return;
            }

            Usuario admin = new Usuario();
            admin.setNombre("Administrador");
            admin.setCorreo(correoNormalizado);
            admin.setPasswordHash(encoder.encode(password));
            admin.setRol(Rol.ADMIN);
            admin.setActivo(true);

            usuarios.save(admin);
        };
    }
}
