package com.gestiondocentes.api.controller;

import com.gestiondocentes.api.dto.DocenteRequest;
import com.gestiondocentes.api.entity.Docente;
import com.gestiondocentes.api.service.DocenteService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/docentes")
public class DocenteController {
  private final DocenteService s;

  public DocenteController(DocenteService s) {
    this.s = s;
  }

  @GetMapping
  public List<Docente> listar() {
    return s.listar();
  }

  @GetMapping("/{id}")
  public Docente buscar(@PathVariable Long id) {
    return s.buscar(id);
  }

  @PostMapping
  public ResponseEntity<Docente> crear(@Valid @RequestBody DocenteRequest q) {
    return ResponseEntity.status(201).body(s.crear(q));
  }

  @PutMapping("/{id}")
  public Docente actualizar(@PathVariable Long id, @Valid @RequestBody DocenteRequest q) {
    return s.actualizar(id, q);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> eliminar(@PathVariable Long id) {
    s.eliminar(id);
    return ResponseEntity.noContent().build();
  }
}
