package com.gestiondocentes.api.controller;

import com.gestiondocentes.api.dto.CarreraRequest;
import com.gestiondocentes.api.entity.Carrera;
import com.gestiondocentes.api.service.CarreraService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/carreras")
public class CarreraController {
  private final CarreraService s;

  public CarreraController(CarreraService s) {
    this.s = s;
  }

  @GetMapping
  public List<Carrera> listar() {
    return s.listar();
  }

  @GetMapping("/{id}")
  public Carrera buscar(@PathVariable Long id) {
    return s.buscar(id);
  }

  @PostMapping
  public ResponseEntity<Carrera> crear(@Valid @RequestBody CarreraRequest q) {
    return ResponseEntity.status(201).body(s.crear(q));
  }

  @PutMapping("/{id}")
  public Carrera actualizar(@PathVariable Long id, @Valid @RequestBody CarreraRequest q) {
    return s.actualizar(id, q);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> eliminar(@PathVariable Long id) {
    s.eliminar(id);
    return ResponseEntity.noContent().build();
  }
}
