package ec.edu.ucacue.ordenes.controller;

import ec.edu.ucacue.ordenes.dto.ActivoRequest;
import ec.edu.ucacue.ordenes.dto.TecnicoResponse;
import ec.edu.ucacue.ordenes.dto.UsuarioRequest;
import ec.edu.ucacue.ordenes.dto.UsuarioResponse;
import ec.edu.ucacue.ordenes.servicio.UsuarioService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    /** GET /api/tecnicos -> lista corta de tecnicos activos (ADMIN o TECNICO). */
    @GetMapping("/api/tecnicos")
    public ResponseEntity<List<TecnicoResponse>> tecnicos() {
        return ResponseEntity.ok(usuarioService.tecnicos());
    }

    // ---- Solo ADMIN (SecurityConfig protege /api/admin/**) ----

    @GetMapping("/api/admin/usuarios")
    public ResponseEntity<List<UsuarioResponse>> listar() {
        return ResponseEntity.ok(usuarioService.listar());
    }

    @PostMapping("/api/admin/usuarios")
    public ResponseEntity<UsuarioResponse> crear(@Valid @RequestBody UsuarioRequest request) {
        UsuarioResponse creado = usuarioService.crear(request);
        return ResponseEntity.created(URI.create("/api/admin/usuarios/" + creado.id())).body(creado);
    }

    @PutMapping("/api/admin/usuarios/{id}")
    public ResponseEntity<UsuarioResponse> actualizar(@PathVariable Long id,
                                                      @Valid @RequestBody UsuarioRequest request,
                                                      Authentication auth) {
        return ResponseEntity.ok(usuarioService.actualizar(id, request, auth.getName()));
    }

    /** PATCH /api/admin/usuarios/{id}/activo -> activa o desactiva la cuenta. */
    @PatchMapping("/api/admin/usuarios/{id}/activo")
    public ResponseEntity<UsuarioResponse> cambiarActivo(@PathVariable Long id,
                                                         @Valid @RequestBody ActivoRequest request,
                                                         Authentication auth) {
        return ResponseEntity.ok(usuarioService.cambiarActivo(id, request.activo(), auth.getName()));
    }

    @DeleteMapping("/api/admin/usuarios/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, Authentication auth) {
        usuarioService.eliminar(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
