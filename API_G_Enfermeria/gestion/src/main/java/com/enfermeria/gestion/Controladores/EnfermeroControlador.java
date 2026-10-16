
package com.enfermeria.gestion.Controladores;

import com.enfermeria.gestion.DTO.EnfermeroRequest;
import com.enfermeria.gestion.DTO.EnfermeroResponse;
import com.enfermeria.gestion.Servicios.EnfermeroServicio;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enfermeros")
@PreAuthorize("hasRole('ADMIN')")
public class EnfermeroControlador {

    private final EnfermeroServicio servicio;

    public EnfermeroControlador(EnfermeroServicio servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public ResponseEntity<List<EnfermeroResponse>> listar() {
        return ResponseEntity.ok(servicio.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnfermeroResponse> obtener(
            @PathVariable Long id) {

        return ResponseEntity.ok(servicio.obtener(id));
    }

    @PostMapping
    public ResponseEntity<EnfermeroResponse> crear(
            @Valid @RequestBody EnfermeroRequest datos) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(servicio.crear(datos));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EnfermeroResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody EnfermeroRequest datos) {

        return ResponseEntity.ok(
                servicio.actualizar(id, datos));
    }

    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<Void> desactivar(
            @PathVariable Long id) {

        servicio.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}
