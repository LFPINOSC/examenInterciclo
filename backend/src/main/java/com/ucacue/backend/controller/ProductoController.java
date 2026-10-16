package com.ucacue.backend.controller;

import com.ucacue.backend.model.Producto;
import com.ucacue.backend.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*") // Permite la conexión con Angular
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    // GET: Listar todos los productos
    @GetMapping
    public List<Producto> listarProductos() {
        return productoRepository.findAll();
    }

    // GET: Buscar producto por ID
    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerProductoPorId(@PathVariable Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con el id: " + id));
        return ResponseEntity.ok(producto);
    }

    // POST: Crear un nuevo producto
    @PostMapping
    public Producto crearProducto(@RequestBody Producto producto) {
        return productoRepository.save(producto);
    }

    // PUT: Actualizar un producto existente
    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizarProducto(@PathVariable Long id, @RequestBody Producto productoDetalles) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con el id: " + id));

        producto.setNombre(productoDetalles.getNombre());
        producto.setDescripcion(productoDetalles.getDescripcion());
        producto.setPrecio(productoDetalles.getPrecio());
        producto.setStock(productoDetalles.getStock());
        producto.setFechaVencimiento(productoDetalles.getFechaVencimiento());
        producto.setCategoria(productoDetalles.getCategoria());
        producto.setProveedor(productoDetalles.getProveedor());

        Producto productoActualizado = productoRepository.save(producto);
        return ResponseEntity.ok(productoActualizado);
    }

    // DELETE: Eliminar un producto
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con el id: " + id));

        productoRepository.delete(producto);
        return ResponseEntity.noContent().build();
    }
}