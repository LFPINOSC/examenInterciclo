package com.gestiondocentes.api.controller;

import com.gestiondocentes.api.dto.PeriodoRequest;
import com.gestiondocentes.api.entity.PeriodoAcademico;
import com.gestiondocentes.api.service.PeriodoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/periodos")
public class PeriodoController {
  private final PeriodoService s;

  public PeriodoController(PeriodoService s) {
    this.s = s;
  }

  @GetMapping
  public List<PeriodoAcademico> listar() {
    return s.listar();
  }

  @GetMapping("/{id}")
  public PeriodoAcademico buscar(@PathVariable Long id) {
    return s.buscar(id);
  }

  @PostMapping
  public ResponseEntity<PeriodoAcademico> crear(@Valid @RequestBody PeriodoRequest q) {
    return ResponseEntity.status(201).body(s.crear(q));
  }

  @PutMapping("/{id}")
  public PeriodoAcademico actualizar(@PathVariable Long id, @Valid @RequestBody PeriodoRequest q) {
    return s.actualizar(id, q);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> eliminar(@PathVariable Long id) {
    s.eliminar(id);
    return ResponseEntity.noContent().build();
  }
}
