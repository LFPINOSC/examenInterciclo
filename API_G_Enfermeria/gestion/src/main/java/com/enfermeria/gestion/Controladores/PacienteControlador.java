

package com.enfermeria.gestion.Controladores;

import com.enfermeria.gestion.DTO.*;
import com.enfermeria.gestion.Servicios.PacienteServicio;

import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pacientes")
public class PacienteControlador {

    private final PacienteServicio servicio;

    public PacienteControlador(PacienteServicio servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public ResponseEntity<List<PacienteResponse>> listar() {
        return ResponseEntity.ok(servicio.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PacienteResponse> obtener(
            @PathVariable Long id) {

        return ResponseEntity.ok(servicio.obtener(id));
    }

    @PostMapping
    public ResponseEntity<PacienteResponse> crear(
            @Valid @RequestBody PacienteRequest datos) {

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(servicio.crear(datos));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PacienteResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PacienteRequest datos) {

        return ResponseEntity.ok(
            servicio.actualizar(id, datos));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {

        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
