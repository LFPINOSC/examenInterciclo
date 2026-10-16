package ec.edu.ucacue.ordenes.controller;

import ec.edu.ucacue.ordenes.dto.EstadoRequest;
import ec.edu.ucacue.ordenes.dto.OrdenRequest;
import ec.edu.ucacue.ordenes.dto.OrdenResponse;
import ec.edu.ucacue.ordenes.dto.ResumenResponse;
import ec.edu.ucacue.ordenes.dto.TareaRequest;
import ec.edu.ucacue.ordenes.dto.TareaResponse;
import ec.edu.ucacue.ordenes.entidad.EstadoOrden;
import ec.edu.ucacue.ordenes.servicio.OrdenService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Ordenes de trabajo y sus tareas. Crear, editar y eliminar ordenes es solo ADMIN (SecurityConfig);
 * el resto lo puede usar el TECNICO, pero unicamente sobre las ordenes que tiene asignadas (OrdenService).
 */
@RestController
public class OrdenController {

    private final OrdenService ordenService;

    public OrdenController(OrdenService ordenService) {
        this.ordenService = ordenService;
    }

    /** GET /api/ordenes?estado=PENDIENTE&q=texto -> admin: todas; tecnico: solo las suyas. */
    @GetMapping("/api/ordenes")
    public ResponseEntity<List<OrdenResponse>> listar(@RequestParam(required = false) EstadoOrden estado,
                                                      @RequestParam(required = false) String q,
                                                      Authentication auth) {
        return ResponseEntity.ok(ordenService.listar(auth.getName(), estado, q));
    }

    @GetMapping("/api/ordenes/{id}")
    public ResponseEntity<OrdenResponse> buscarPorId(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(ordenService.buscarPorId(id, auth.getName()));
    }

    @PostMapping("/api/ordenes")
    public ResponseEntity<OrdenResponse> crear(@Valid @RequestBody OrdenRequest request, Authentication auth) {
        OrdenResponse creada = ordenService.crear(request, auth.getName());
        return ResponseEntity.created(URI.create("/api/ordenes/" + creada.id())).body(creada);
    }

    @PutMapping("/api/ordenes/{id}")
    public ResponseEntity<OrdenResponse> actualizar(@PathVariable Long id, @Valid @RequestBody OrdenRequest request) {
        return ResponseEntity.ok(ordenService.actualizar(id, request));
    }

    /** PATCH /api/ordenes/{id}/estado -> ADMIN o el tecnico asignado. */
    @PatchMapping("/api/ordenes/{id}/estado")
    public ResponseEntity<OrdenResponse> cambiarEstado(@PathVariable Long id,
                                                       @Valid @RequestBody EstadoRequest request,
                                                       Authentication auth) {
        return ResponseEntity.ok(ordenService.cambiarEstado(id, request, auth.getName()));
    }

    @DeleteMapping("/api/ordenes/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        ordenService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Tareas ----

    @PostMapping("/api/ordenes/{id}/tareas")
    public ResponseEntity<TareaResponse> agregarTarea(@PathVariable Long id,
                                                      @Valid @RequestBody TareaRequest request,
                                                      Authentication auth) {
        TareaResponse creada = ordenService.agregarTarea(id, request, auth.getName());
        return ResponseEntity.created(URI.create("/api/tareas/" + creada.id())).body(creada);
    }

    @PutMapping("/api/tareas/{id}")
    public ResponseEntity<TareaResponse> actualizarTarea(@PathVariable Long id,
                                                         @Valid @RequestBody TareaRequest request,
                                                         Authentication auth) {
        return ResponseEntity.ok(ordenService.actualizarTarea(id, request, auth.getName()));
    }

    @DeleteMapping("/api/tareas/{id}")
    public ResponseEntity<Void> eliminarTarea(@PathVariable Long id, Authentication auth) {
        ordenService.eliminarTarea(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    // ---- Tablero ----

    @GetMapping("/api/resumen")
    public ResponseEntity<ResumenResponse> resumen(Authentication auth) {
        return ResponseEntity.ok(ordenService.resumen(auth.getName()));
    }
}
