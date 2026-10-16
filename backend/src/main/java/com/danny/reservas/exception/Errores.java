package com.danny.reservas.exception;

import java.util.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class Errores {
  @ExceptionHandler(ApiException.class)
  ResponseEntity<?> api(ApiException e) {
    return ResponseEntity.status(e.status).body(Map.of("error", e.getMessage()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<?> valid(MethodArgumentNotValidException e) {
    return ResponseEntity.badRequest()
        .body(
            Map.of(
                "error",
                "Revisa los datos del formulario",
                "detalles",
                e.getBindingResult().getFieldErrors().stream()
                    .map(f -> f.getField() + ": " + f.getDefaultMessage())
                    .toList()));
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  ResponseEntity<?> relation(Exception e) {
    return ResponseEntity.status(409)
        .body(
            Map.of(
                "error",
                "Registro duplicado o relacionado con otros datos. No se puede completar la"
                    + " operación."));
  }

  @ExceptionHandler({
    org.springframework.http.converter.HttpMessageNotReadableException.class,
    org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class
  })
  ResponseEntity<?> format(Exception e) {
    return ResponseEntity.badRequest().body(Map.of("error", "Formato de datos incorrecto"));
  }
}
