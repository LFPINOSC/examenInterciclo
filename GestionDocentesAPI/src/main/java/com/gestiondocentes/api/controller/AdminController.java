package com.gestiondocentes.api.controller;

import com.gestiondocentes.api.dto.UsuarioResponse;
import com.gestiondocentes.api.service.AdminService;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/usuarios")
@Validated
public class AdminController {
  private final AdminService service;

  public AdminController(AdminService service) {
    this.service = service;
  }

  @GetMapping
  public List<UsuarioResponse> listar() {
    return service.listar();
  }

  @GetMapping("/pendientes")
  public List<UsuarioResponse> pendientes() {
    return service.pendientes();
  }

  @PutMapping("/{id}/aprobar")
  public UsuarioResponse aprobar(@PathVariable @Positive Long id) {
    return service.aprobar(id);
  }

  @PutMapping("/{id}/bloquear")
  public UsuarioResponse bloquear(@PathVariable @Positive Long id) {
    return service.bloquear(id);
  }

  @PutMapping("/{id}/activar")
  public UsuarioResponse activar(@PathVariable @Positive Long id) {
    return service.activar(id);
  }
}
