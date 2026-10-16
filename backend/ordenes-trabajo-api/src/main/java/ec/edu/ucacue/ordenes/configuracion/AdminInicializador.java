package ec.edu.ucacue.ordenes.configuracion;

import ec.edu.ucacue.ordenes.entidad.Rol;
import ec.edu.ucacue.ordenes.entidad.Usuario;
import ec.edu.ucacue.ordenes.repositorio.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Crea el primer administrador al arrancar; sin el nadie podria gestionar el sistema.
 * Se hace aqui y no en SQL porque la contrasena debe guardarse con el hash BCrypt del PasswordEncoder.
 */
@Component
public class AdminInicializador implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminInicializador.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final String username;
    private final String correo;
    private final String password;

    public AdminInicializador(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                              @Value("${app.admin.username}") String username,
                              @Value("${app.admin.correo}") String correo,
                              @Value("${app.admin.password}") String password) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.username = username;
        this.correo = correo;
        this.password = password;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.existsByUsernameIgnoreCase(username)) {
            return;
        }
        Usuario admin = new Usuario();
        admin.setUsername(username);
        admin.setCorreo(correo);
        admin.setNombre("Administrador del sistema");
        admin.setPassword(passwordEncoder.encode(password));
        admin.setRol(Rol.ADMIN);
        usuarioRepository.save(admin);
        log.info("Administrador inicial creado: usuario '{}'", username);
    }
}
