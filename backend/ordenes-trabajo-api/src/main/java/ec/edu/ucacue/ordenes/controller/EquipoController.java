package ec.edu.ucacue.ordenes.controller;

import ec.edu.ucacue.ordenes.dto.EquipoRequest;
import ec.edu.ucacue.ordenes.dto.EquipoResponse;
import ec.edu.ucacue.ordenes.servicio.EquipoService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** CRUD de equipos (solo ADMIN). */
@RestController
@RequestMapping("/api/equipos")
public class EquipoController {

    private final EquipoService equipoService;

    public EquipoController(EquipoService equipoService) {
        this.equipoService = equipoService;
    }

    /** GET /api/equipos?clienteId=1 -> equipos de un cliente (o todos). */
    @GetMapping
    public ResponseEntity<List<EquipoResponse>> listar(@RequestParam(required = false) Long clienteId) {
        return ResponseEntity.ok(equipoService.listar(clienteId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(equipoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<EquipoResponse> crear(@Valid @RequestBody EquipoRequest request) {
        EquipoResponse creado = equipoService.crear(request);
        return ResponseEntity.created(URI.create("/api/equipos/" + creado.id())).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipoResponse> actualizar(@PathVariable Long id, @Valid @RequestBody EquipoRequest request) {
        return ResponseEntity.ok(equipoService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        equipoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
