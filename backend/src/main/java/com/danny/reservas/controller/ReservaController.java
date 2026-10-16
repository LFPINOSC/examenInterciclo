package com.danny.reservas.controller;

import com.danny.reservas.dto.Datos;
import com.danny.reservas.model.Actor;
import com.danny.reservas.service.ReservaService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {
  private final ReservaService s;

  public ReservaController(ReservaService s) {
    this.s = s;
  }

  @GetMapping
  public Object lista(@AuthenticationPrincipal Actor a) {
    return s.lista(a);
  }

  @GetMapping("/{id}")
  public Object uno(@PathVariable long id, @AuthenticationPrincipal Actor a) {
    return s.uno(id, a);
  }

  @PostMapping
  @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
  public Object crear(@Valid @RequestBody Datos.Reserva d, @AuthenticationPrincipal Actor a) {
    return s.crear(d, a);
  }

  @PutMapping("/{id}")
  public Object editar(
      @PathVariable long id,
      @Valid @RequestBody Datos.Reserva d,
      @AuthenticationPrincipal Actor a) {
    return s.editar(id, d, a);
  }

  @PatchMapping("/{id}/cancelar")
  @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
  public void cancelar(@PathVariable long id, @AuthenticationPrincipal Actor a) {
    s.cancelar(id, a);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
  public void borrar(@PathVariable long id, @AuthenticationPrincipal Actor a) {
    s.borrar(id, a);
  }
}
