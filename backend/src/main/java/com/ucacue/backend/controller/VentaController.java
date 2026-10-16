package com.ucacue.backend.controller;

import com.ucacue.backend.model.Venta;
import com.ucacue.backend.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class VentaController {

    @Autowired
    private VentaRepository ventaRepository;

    /**
     * MÉTODO LISTAR: Muestra el historial completo de ventas realizadas.
     */
    @GetMapping
    public List<Venta> listarVentas() {
        return ventaRepository.findAll();
    }

    /**
     * MÉTODO BUSCAR POR ID: Consulta el detalle de una venta específica por ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Venta> obtenerVentaPorId(@PathVariable Long id) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada con el id: " + id));
        return ResponseEntity.ok(venta);
    }

    /**
     * MÉTODO CREAR: Registra una nueva venta realizada a un cliente.
     */
    @PostMapping
    public Venta crearVenta(@RequestBody Venta venta) {
        return ventaRepository.save(venta);
    }

   
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarVenta(@PathVariable Long id) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada con el id: " + id));

        ventaRepository.delete(venta);
        return ResponseEntity.noContent().build();
    }
}