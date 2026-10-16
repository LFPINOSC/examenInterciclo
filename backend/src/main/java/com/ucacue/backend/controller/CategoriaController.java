package com.ucacue.backend.controller;

import com.ucacue.backend.model.Categoria;
import com.ucacue.backend.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "*")
public class CategoriaController {

    @Autowired
    private CategoriaRepository categoriaRepository;

    /**
     * MÉTODO LISTAR: Devuelve todas las categorías registradas.
     */
    @GetMapping
    public List<Categoria> listarCategorias() {
        return categoriaRepository.findAll();
    }

    /**
     * MÉTODO BUSCAR POR ID: Busca una categoría por su identificador.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Categoria> obtenerCategoriaPorId(@PathVariable Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con el id: " + id));
        return ResponseEntity.ok(categoria);
    }

    /**
     * MÉTODO CREAR: Registra una nueva categoría en la base de datos.
     */
    @PostMapping
    public Categoria crearCategoria(@RequestBody Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    /**
     * MÉTODO ACTUALIZAR: Modifica los datos de una categoría existente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Categoria> actualizarCategoria(@PathVariable Long id, @RequestBody Categoria categoriaDetalles) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con el id: " + id));

        categoria.setNombre(categoriaDetalles.getNombre());
        categoria.setDescripcion(categoriaDetalles.getDescripcion());

        Categoria categoriaActualizada = categoriaRepository.save(categoria);
        return ResponseEntity.ok(categoriaActualizada);
    }

    /**
     * MÉTODO ELIMINAR: Borra una categoría por su ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCategoria(@PathVariable Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con el id: " + id));

        categoriaRepository.delete(categoria);
        return ResponseEntity.noContent().build();
    }
}