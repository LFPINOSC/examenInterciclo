package com.kevmarca.inventario.service;

import com.kevmarca.inventario.dto.UsuarioRequest;
import com.kevmarca.inventario.exception.RecursoNoEncontradoException;
import com.kevmarca.inventario.exception.ReglaNegocioException;
import com.kevmarca.inventario.model.Usuario;
import com.kevmarca.inventario.repository.MovimientoInventarioRepository;
import com.kevmarca.inventario.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final MovimientoInventarioRepository movimientoRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          MovimientoInventarioRepository movimientoRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.movimientoRepository = movimientoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    public Usuario obtener(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario con id " + id + " no encontrado"));
    }

    public Usuario obtenerPorUsername(String username) {
        return usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
    }

    @Transactional
    public Usuario crear(UsuarioRequest req) {
        if (usuarioRepository.existsByUsername(req.username().trim())) {
            throw new ReglaNegocioException("El nombre de usuario ya está en uso");
        }
        validarClave(req.password(), true);

        Usuario u = new Usuario();
        u.setNombre(req.nombre().trim());
        u.setUsername(req.username().trim());
        u.setPassword(passwordEncoder.encode(req.password()));
        u.setRol(req.rol());
        u.setActivo(req.activo() == null || req.activo());
        return usuarioRepository.save(u);
    }

    @Transactional
    public Usuario actualizar(Long id, UsuarioRequest req, String usernameActual) {
        Usuario u = obtener(id);
        String nuevoUsername = req.username().trim();

        if (!u.getUsername().equals(nuevoUsername) && usuarioRepository.existsByUsername(nuevoUsername)) {
            throw new ReglaNegocioException("El nombre de usuario ya está en uso");
        }
        if (u.getUsername().equals(usernameActual) && Boolean.FALSE.equals(req.activo())) {
            throw new ReglaNegocioException("No puede desactivar su propia cuenta");
        }

        u.setNombre(req.nombre().trim());
        u.setUsername(nuevoUsername);
        u.setRol(req.rol());
        if (req.activo() != null) {
            u.setActivo(req.activo());
        }
        // Contraseña opcional al editar
        if (req.password() != null && !req.password().isBlank()) {
            validarClave(req.password(), false);
            u.setPassword(passwordEncoder.encode(req.password()));
        }
        return usuarioRepository.save(u);
    }

    @Transactional
    public void eliminar(Long id, String usernameActual) {
        Usuario u = obtener(id);
        if (u.getUsername().equals(usernameActual)) {
            throw new ReglaNegocioException("No puede eliminar su propia cuenta");
        }
        if (movimientoRepository.existsByUsuarioId(id)) {
            throw new ReglaNegocioException(
                    "No se puede eliminar: el usuario registró movimientos. Puede desactivarlo.");
        }
        usuarioRepository.delete(u);
    }

    private void validarClave(String clave, boolean obligatoria) {
        if (clave == null || clave.isBlank()) {
            if (obligatoria) throw new ReglaNegocioException("La contraseña es obligatoria");
            return;
        }
        if (clave.length() < 6) {
            throw new ReglaNegocioException("La contraseña debe tener al menos 6 caracteres");
        }
    }
}
