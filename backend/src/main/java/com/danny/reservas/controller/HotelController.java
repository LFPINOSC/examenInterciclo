package com.danny.reservas.controller;

import com.danny.reservas.dto.Datos;
import com.danny.reservas.service.CatalogoService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hoteles")
public class HotelController {
  private final CatalogoService s;

  public HotelController(CatalogoService s) {
    this.s = s;
  }

  @GetMapping
  public Object lista() {
    return s.hoteles();
  }

  @GetMapping("/{id}")
  public Object uno(@PathVariable long id) {
    return s.hotel(id);
  }

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
  public Object crear(@Valid @RequestBody Datos.Hotel d) {
    return s.crearHotel(d);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public Object editar(@PathVariable long id, @Valid @RequestBody Datos.Hotel d) {
    return s.editarHotel(id, d);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
  public void borrar(@PathVariable long id) {
    s.borrarHotel(id);
  }
}
