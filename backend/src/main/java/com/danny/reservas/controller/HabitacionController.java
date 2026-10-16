package com.danny.reservas.controller;

import com.danny.reservas.dto.Datos;
import com.danny.reservas.service.CatalogoService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/habitaciones")
public class HabitacionController {
  private final CatalogoService s;

  public HabitacionController(CatalogoService s) {
    this.s = s;
  }

  @GetMapping
  public Object lista(
      @RequestParam(required = false) LocalDate entrada,
      @RequestParam(required = false) LocalDate salida,
      @RequestParam(required = false) Integer huespedes) {
    return s.habitaciones(entrada, salida, huespedes);
  }

  @GetMapping("/{id}")
  public Object uno(@PathVariable long id) {
    return s.habitacion(id);
  }

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
  public Object crear(@Valid @RequestBody Datos.Habitacion d) {
    return s.crearHabitacion(d);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public Object editar(@PathVariable long id, @Valid @RequestBody Datos.Habitacion d) {
    return s.editarHabitacion(id, d);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
  public void borrar(@PathVariable long id) {
    s.borrarHabitacion(id);
  }
}
