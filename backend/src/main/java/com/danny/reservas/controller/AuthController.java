package com.danny.reservas.controller;

import com.danny.reservas.dto.Datos;
import com.danny.reservas.model.Actor;
import com.danny.reservas.security.JwtService;
import com.danny.reservas.service.AuthService;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {
  private final AuthService service;
  private final JwtService jwt;

  public AuthController(AuthService service, JwtService jwt) {
    this.service = service;
    this.jwt = jwt;
  }

  @GetMapping("/health")
  public Object health() {
    return Map.of("servicio", "reservas-hoteleras", "estado", "OK");
  }

  @PostMapping("/auth/registro")
  @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
  public Object registro(@Valid @RequestBody Datos.Registro d) {
    return service.registrar(d);
  }

  @PostMapping("/auth/login")
  public Object login(@Valid @RequestBody Datos.Login d) {
    Actor a = service.login(d);
    return Map.of("token", jwt.emitir(a), "usuario", a);
  }

  @GetMapping("/auth/me")
  public Actor me(@AuthenticationPrincipal Actor a) {
    return a;
  }

  @PostMapping("/auth/logout")
  @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
  public void logout(@AuthenticationPrincipal Actor a) {
    service.logout(a);
  }

  @GetMapping("/usuarios")
  @PreAuthorize("hasRole('ADMIN')")
  public Object usuarios() {
    return service.usuarios();
  }

  @PatchMapping("/usuarios/{id}/activo")
  @PreAuthorize("hasRole('ADMIN')")
  @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
  public void activo(
      @PathVariable long id, @RequestBody Datos.Activo d, @AuthenticationPrincipal Actor a) {
    service.activo(id, d.activo(), a);
  }
}
