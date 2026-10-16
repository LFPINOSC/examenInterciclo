package com.kevmarca.inventario.controller;

import com.kevmarca.inventario.dto.ProductoRequest;
import com.kevmarca.inventario.model.Producto;
import com.kevmarca.inventario.service.ProductoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService service;

    public ProductoController(ProductoService service) {
        this.service = service;
    }

    /** GET /api/productos?buscar=agua  -> filtra por nombre o código */
    @GetMapping
    public List<Producto> listar(@RequestParam(required = false) String buscar) {
        return service.listar(buscar);
    }

    /** GET /api/productos/stock-bajo -> productos que deben reabastecerse */
    @GetMapping("/stock-bajo")
    public List<Producto> stockBajo() {
        return service.listarStockBajo();
    }

    @GetMapping("/{id}")
    public Producto obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    public ResponseEntity<Producto> crear(@Valid @RequestBody ProductoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(req));
    }

    @PutMapping("/{id}")
    public Producto actualizar(@PathVariable Long id, @Valid @RequestBody ProductoRequest req) {
        return service.actualizar(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
