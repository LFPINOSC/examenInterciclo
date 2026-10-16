
package com.enfermeria.gestion.Controladores;

import com.enfermeria.gestion.DTO.ActividadRequest;
import com.enfermeria.gestion.DTO.ActividadResponse;
import com.enfermeria.gestion.Entidades.EstadoActividad;
import com.enfermeria.gestion.Servicios.ActividadServicio;
import com.enfermeria.gestion.Seguridad.UsuarioActualServicio;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/actividades")
public class ActividadControlador {

    private final ActividadServicio servicio;
    private final UsuarioActualServicio usuarioActual;

    public ActividadControlador(
            ActividadServicio servicio,
            UsuarioActualServicio usuarioActual) {
        this.servicio = servicio;
        this.usuarioActual = usuarioActual;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ActividadResponse>> listar() {
        return ResponseEntity.ok(servicio.listar());
    }

    @GetMapping("/mis-actividades")
    @PreAuthorize("hasRole('ENFERMERO')")
    public ResponseEntity<List<ActividadResponse>> misActividades() {
        Long enfermeroId = usuarioActual.enfermeroActualId();
        return ResponseEntity.ok(
                servicio.porEnfermero(enfermeroId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ActividadResponse> obtener(
            @PathVariable Long id) {
        return ResponseEntity.ok(servicio.obtener(id));
    }

    @GetMapping("/paciente/{pacienteId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ActividadResponse>> porPaciente(
            @PathVariable Long pacienteId) {
        return ResponseEntity.ok(
                servicio.porPaciente(pacienteId));
    }

    @GetMapping("/enfermero/{enfermeroId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ActividadResponse>> porEnfermero(
            @PathVariable Long enfermeroId) {
        return ResponseEntity.ok(
                servicio.porEnfermero(enfermeroId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ActividadResponse> crear(
            @Valid @RequestBody ActividadRequest datos) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(servicio.crear(datos));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ActividadResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActividadRequest datos) {
        return ResponseEntity.ok(
                servicio.actualizar(id, datos));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ActividadResponse> cambiarEstado(
            @PathVariable Long id,
            @RequestParam EstadoActividad estado) {
        return ResponseEntity.ok(
                servicio.cambiarEstado(id, estado));
    }

    @PatchMapping("/{id}/cancelar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> cancelar(
            @PathVariable Long id) {
        servicio.cancelar(id);
        return ResponseEntity.noContent().build();
    }
}
