package ec.edu.ucacue.ordenes.servicio;

import ec.edu.ucacue.ordenes.dto.LoginRequest;
import ec.edu.ucacue.ordenes.dto.LoginResponse;
import ec.edu.ucacue.ordenes.dto.UsuarioResponse;
import ec.edu.ucacue.ordenes.entidad.Usuario;
import ec.edu.ucacue.ordenes.excepcion.AccesoDenegadoException;
import ec.edu.ucacue.ordenes.excepcion.CredencialesInvalidasException;
import ec.edu.ucacue.ordenes.excepcion.RecursoNoEncontradoException;
import ec.edu.ucacue.ordenes.repositorio.UsuarioRepository;
import ec.edu.ucacue.ordenes.seguridad.JwtService;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final int maxIntentos;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                       JwtService jwtService, @Value("${app.login.max-intentos}") int maxIntentos) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.maxIntentos = maxIntentos;
    }

    /**
     * Valida credenciales. Tras max-intentos fallos seguidos la cuenta se desactiva y solo un
     * administrador puede reactivarla (proteccion contra fuerza bruta). El mensaje de error es
     * el mismo para usuario inexistente y contrasena incorrecta, para no revelar cuentas validas.
     */
    @Transactional(noRollbackFor = CredencialesInvalidasException.class)
    public LoginResponse login(LoginRequest request) {
        String identificador = request.username().trim();
        Usuario usuario = usuarioRepository
                .findByUsernameIgnoreCaseOrCorreoIgnoreCase(identificador, identificador)
                .orElseThrow(() -> new CredencialesInvalidasException("Usuario o contrasena incorrectos"));

        if (!usuario.getActivo()) {
            throw new AccesoDenegadoException("La cuenta esta desactivada. Contacte al administrador");
        }
        if (!passwordEncoder.matches(request.password(), usuario.getPassword())) {
            usuario.setIntentosFallidos(usuario.getIntentosFallidos() + 1);
            if (usuario.getIntentosFallidos() >= maxIntentos) {
                usuario.setActivo(false);
                usuarioRepository.save(usuario);
                throw new AccesoDenegadoException(
                        "Demasiados intentos fallidos: la cuenta fue desactivada. Contacte al administrador");
            }
            usuarioRepository.save(usuario);
            throw new CredencialesInvalidasException("Usuario o contrasena incorrectos");
        }

        usuario.setIntentosFallidos(0);
        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);
        return new LoginResponse(jwtService.generarToken(usuario), usuario.getUsername(), usuario.getNombre(),
                usuario.getRol().name(), jwtService.calcularExpiracion());
    }

    @Transactional(readOnly = true)
    public UsuarioResponse perfil(String username) {
        Usuario u = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario", 0L));
        return UsuarioService.aResponse(u);
    }
}
