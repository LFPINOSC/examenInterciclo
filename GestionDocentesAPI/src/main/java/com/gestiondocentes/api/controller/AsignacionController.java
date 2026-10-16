package com.gestiondocentes.api.controller;

import com.gestiondocentes.api.dto.*;
import com.gestiondocentes.api.service.AsignacionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/asignaciones")
public class AsignacionController {
  private final AsignacionService s;

  public AsignacionController(AsignacionService s) {
    this.s = s;
  }

  @GetMapping
  public List<AsignacionResponse> listar() {
    return s.listar();
  }

  @GetMapping("/{id}")
  public AsignacionResponse buscar(@PathVariable Long id) {
    return s.buscar(id);
  }

  @PostMapping
  public ResponseEntity<AsignacionResponse> crear(@Valid @RequestBody AsignacionRequest q) {
    return ResponseEntity.status(201).body(s.crear(q));
  }

  @PutMapping("/{id}")
  public AsignacionResponse actualizar(
      @PathVariable Long id, @Valid @RequestBody AsignacionRequest q) {
    return s.actualizar(id, q);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> eliminar(@PathVariable Long id) {
    s.eliminar(id);
    return ResponseEntity.noContent().build();
  }
}
