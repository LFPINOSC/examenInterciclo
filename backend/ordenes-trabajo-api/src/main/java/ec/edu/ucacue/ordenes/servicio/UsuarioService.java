package ec.edu.ucacue.ordenes.servicio;

import ec.edu.ucacue.ordenes.dto.TecnicoResponse;
import ec.edu.ucacue.ordenes.dto.UsuarioRequest;
import ec.edu.ucacue.ordenes.dto.UsuarioResponse;
import ec.edu.ucacue.ordenes.entidad.Rol;
import ec.edu.ucacue.ordenes.entidad.Usuario;
import ec.edu.ucacue.ordenes.excepcion.RecursoDuplicadoException;
import ec.edu.ucacue.ordenes.excepcion.RecursoNoEncontradoException;
import ec.edu.ucacue.ordenes.excepcion.ReglaNegocioException;
import ec.edu.ucacue.ordenes.excepcion.SolicitudInvalidaException;
import ec.edu.ucacue.ordenes.repositorio.OrdenTrabajoRepository;
import ec.edu.ucacue.ordenes.repositorio.UsuarioRepository;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Gestion de usuarios (solo ADMIN): administradores y tecnicos. */
@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final OrdenTrabajoRepository ordenRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, OrdenTrabajoRepository ordenRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.ordenRepository = ordenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll().stream()
                .sorted((a, b) -> a.getId().compareTo(b.getId()))
                .map(UsuarioService::aResponse).toList();
    }

    /** Tecnicos activos, para el desplegable "tecnico asignado" de las ordenes. */
    @Transactional(readOnly = true)
    public List<TecnicoResponse> tecnicos() {
        return usuarioRepository.findByRolAndActivoTrueOrderByNombre(Rol.TECNICO).stream()
                .map(u -> new TecnicoResponse(u.getId(), u.getNombre())).toList();
    }

    @Transactional
    public UsuarioResponse crear(UsuarioRequest request) {
        validarPassword(request.password(), true);
        if (usuarioRepository.existsByUsernameIgnoreCase(request.username())) {
            throw new RecursoDuplicadoException("Ya existe el usuario " + request.username());
        }
        if (usuarioRepository.existsByCorreoIgnoreCase(request.correo())) {
            throw new RecursoDuplicadoException("Ya existe un usuario con el correo " + request.correo());
        }
        Usuario u = new Usuario();
        u.setUsername(request.username().trim());
        u.setNombre(request.nombre().trim());
        u.setCorreo(request.correo().trim());
        u.setPassword(passwordEncoder.encode(request.password()));
        u.setRol(request.rol());
        return aResponse(usuarioRepository.save(u));
    }

    @Transactional
    public UsuarioResponse actualizar(Long id, UsuarioRequest request, String usuarioActual) {
        Usuario u = obtener(id);
        validarPassword(request.password(), false);
        if (usuarioRepository.existsByCorreoIgnoreCaseAndIdNot(request.correo(), id)) {
            throw new RecursoDuplicadoException("Ya existe otro usuario con el correo " + request.correo());
        }
        if (!u.getUsername().equalsIgnoreCase(request.username())
                && usuarioRepository.existsByUsernameIgnoreCase(request.username())) {
            throw new RecursoDuplicadoException("Ya existe el usuario " + request.username());
        }
        if (u.getUsername().equals(usuarioActual) && request.rol() != Rol.ADMIN) {
            throw new ReglaNegocioException("No puede quitarse el rol de administrador a si mismo");
        }
        u.setUsername(request.username().trim());
        u.setNombre(request.nombre().trim());
        u.setCorreo(request.correo().trim());
        u.setRol(request.rol());
        if (request.password() != null && !request.password().isBlank()) {
            u.setPassword(passwordEncoder.encode(request.password()));
        }
        return aResponse(usuarioRepository.save(u));
    }

    /** Activa o desactiva la cuenta. Reactivar tambien reinicia el contador de intentos fallidos. */
    @Transactional
    public UsuarioResponse cambiarActivo(Long id, boolean activo, String usuarioActual) {
        Usuario u = obtener(id);
        if (!activo && u.getUsername().equals(usuarioActual)) {
            throw new ReglaNegocioException("No puede desactivar su propia cuenta");
        }
        u.setActivo(activo);
        u.setIntentosFallidos(0);
        return aResponse(usuarioRepository.save(u));
    }

    @Transactional
    public void eliminar(Long id, String usuarioActual) {
        Usuario u = obtener(id);
        if (u.getUsername().equals(usuarioActual)) {
            throw new ReglaNegocioException("No puede eliminar su propia cuenta");
        }
        // El historial de ordenes se conserva: en ese caso se recomienda desactivar en vez de eliminar.
        if (ordenRepository.existsByTecnicoIdOrCreadoPorId(id, id)) {
            throw new ReglaNegocioException(
                    "El usuario tiene ordenes asociadas; desactive la cuenta en lugar de eliminarla");
        }
        usuarioRepository.delete(u);
    }

    private Usuario obtener(Long id) {
        return usuarioRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Usuario", id));
    }

    private void validarPassword(String password, boolean obligatoria) {
        boolean vacia = password == null || password.isBlank();
        if (vacia && obligatoria) {
            throw new SolicitudInvalidaException("La contrasena es obligatoria");
        }
        if (!vacia && (password.length() < 8 || !password.matches(".*[A-Za-z].*") || !password.matches(".*\\d.*"))) {
            throw new SolicitudInvalidaException("La contrasena debe tener al menos 8 caracteres, con letras y numeros");
        }
    }

    static UsuarioResponse aResponse(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getUsername(), u.getNombre(), u.getCorreo(), u.getRol().name(),
                u.getActivo(), u.getUltimoAcceso(), u.getFechaRegistro());
    }
}
