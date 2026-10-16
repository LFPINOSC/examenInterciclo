
package com.enfermeria.gestion.Controladores;

import com.enfermeria.gestion.DTO.TurnoRequest;
import com.enfermeria.gestion.DTO.TurnoResponse;
import com.enfermeria.gestion.Servicios.TurnoServicio;
import com.enfermeria.gestion.Seguridad.UsuarioActualServicio;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/turnos")
public class TurnoControlador {

    private final TurnoServicio servicio;
    private final UsuarioActualServicio usuarioActual;

    public TurnoControlador(
            TurnoServicio servicio,
            UsuarioActualServicio usuarioActual) {
        this.servicio = servicio;
        this.usuarioActual = usuarioActual;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TurnoResponse>> listar() {
        return ResponseEntity.ok(servicio.listar());
    }

    @GetMapping("/mis-turnos")
    @PreAuthorize("hasRole('ENFERMERO')")
    public ResponseEntity<List<TurnoResponse>> misTurnos() {
        Long enfermeroId = usuarioActual.enfermeroActualId();
        return ResponseEntity.ok(
                servicio.porEnfermero(enfermeroId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TurnoResponse> obtener(
            @PathVariable Long id) {
        return ResponseEntity.ok(servicio.obtener(id));
    }

    @GetMapping("/enfermero/{enfermeroId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TurnoResponse>> porEnfermero(
            @PathVariable Long enfermeroId) {
        return ResponseEntity.ok(
                servicio.porEnfermero(enfermeroId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TurnoResponse> crear(
            @Valid @RequestBody TurnoRequest datos) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(servicio.crear(datos));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TurnoResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody TurnoRequest datos) {
        return ResponseEntity.ok(
                servicio.actualizar(id, datos));
    }

    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> desactivar(
            @PathVariable Long id) {
        servicio.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}
