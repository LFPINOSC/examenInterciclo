package com.gestiondocentes.api.controller;

import com.gestiondocentes.api.dto.AsignaturaRequest;
import com.gestiondocentes.api.entity.Asignatura;
import com.gestiondocentes.api.service.AsignaturaService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/asignaturas")
public class AsignaturaController {
  private final AsignaturaService s;

  public AsignaturaController(AsignaturaService s) {
    this.s = s;
  }

  @GetMapping
  public List<Asignatura> listar() {
    return s.listar();
  }

  @GetMapping("/{id}")
  public Asignatura buscar(@PathVariable Long id) {
    return s.buscar(id);
  }

  @PostMapping
  public ResponseEntity<Asignatura> crear(@Valid @RequestBody AsignaturaRequest q) {
    return ResponseEntity.status(201).body(s.crear(q));
  }

  @PutMapping("/{id}")
  public Asignatura actualizar(@PathVariable Long id, @Valid @RequestBody AsignaturaRequest q) {
    return s.actualizar(id, q);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> eliminar(@PathVariable Long id) {
    s.eliminar(id);
    return ResponseEntity.noContent().build();
  }
}
