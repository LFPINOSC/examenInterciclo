package com.kevmarca.inventario.controller;

import com.kevmarca.inventario.dto.MovimientoRequest;
import com.kevmarca.inventario.model.MovimientoInventario;
import com.kevmarca.inventario.service.MovimientoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Los movimientos son un historial (kardex): se registran y se consultan.
 * No se editan; si hubo un error se anulan (DELETE), lo que revierte el stock.
 */
@RestController
@RequestMapping("/api/movimientos")
public class MovimientoController {

    private final MovimientoService service;

    public MovimientoController(MovimientoService service) {
        this.service = service;
    }

    /** GET /api/movimientos?productoId=1 -> historial (opcionalmente de un producto) */
    @GetMapping
    public List<MovimientoInventario> listar(@RequestParam(required = false) Long productoId) {
        return service.listar(productoId);
    }

    @GetMapping("/{id}")
    public MovimientoInventario obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    /** El usuario que registra se toma del token, no del cuerpo de la petición. */
    @PostMapping
    public ResponseEntity<MovimientoInventario> registrar(@Valid @RequestBody MovimientoRequest req,
                                                          Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.registrar(req, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> anular(@PathVariable Long id) {
        service.anular(id);
        return ResponseEntity.noContent().build();
    }
}
