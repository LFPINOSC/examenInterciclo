package com.gestiondocentes.api.controller;

import com.gestiondocentes.api.dto.*;
import com.gestiondocentes.api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthService s;

  public AuthController(AuthService s) {
    this.s = s;
  }

  @PostMapping("/registro")
  ResponseEntity<RegistroResponse> reg(@Valid @RequestBody RegistroRequest q) {
    return ResponseEntity.status(201).body(s.registrar(q));
  }

  @PostMapping("/verificar")
  String ver(@Valid @RequestBody VerificacionRequest q) {
    return s.verificar(q);
  }

  @PostMapping("/reenviar-codigo")
  String ree(@Valid @RequestBody ReenviarCodigoRequest q) {
    return s.reenviar(q);
  }

  @PostMapping("/login")
  AuthResponse log(@Valid @RequestBody LoginRequest q) {
    return s.login(q);
  }
}
