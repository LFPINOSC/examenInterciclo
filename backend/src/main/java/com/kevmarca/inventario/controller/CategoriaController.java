package com.kevmarca.inventario.controller;

import com.kevmarca.inventario.model.Categoria;
import com.kevmarca.inventario.service.CategoriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// 📌 CRUD de categorías: GET listar/obtener, POST crear, PUT editar, DELETE eliminar
@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService service;

    public CategoriaController(CategoriaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Categoria> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Categoria obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    // @Valid revisa las anotaciones de la entidad (@NotBlank...). Si falla -> 400
    @PostMapping
    public ResponseEntity<Categoria> crear(@Valid @RequestBody Categoria categoria) {
        // 201 Created = se creó correctamente
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(categoria));
    }

    @PutMapping("/{id}")
    public Categoria actualizar(@PathVariable Long id, @Valid @RequestBody Categoria categoria) {
        return service.actualizar(id, categoria);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        // 204 No Content = eliminado, sin cuerpo
        return ResponseEntity.noContent().build();
    }
}
