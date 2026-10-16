package com.ucacue.backend.controller;

import com.ucacue.backend.model.Proveedor;
import com.ucacue.backend.repository.ProveedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@CrossOrigin(origins = "*")
public class ProveedorController {

    @Autowired
    private ProveedorRepository proveedorRepository;

    /**
     * MÉTODO LISTAR: Devuelve la lista de todos los proveedores.
     */
    @GetMapping
    public List<Proveedor> listarProveedores() {
        return proveedorRepository.findAll();
    }

    /**
     * MÉTODO BUSCAR POR ID: Obtiene un proveedor específico por su ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Proveedor> obtenerProveedorPorId(@PathVariable Long id) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con el id: " + id));
        return ResponseEntity.ok(proveedor);
    }

    /**
     * MÉTODO CREAR: Da de alta un nuevo proveedor en el sistema.
     */
    @PostMapping
    public Proveedor crearProveedor(@RequestBody Proveedor proveedor) {
        return proveedorRepository.save(proveedor);
    }

    /**
     * MÉTODO ACTUALIZAR: Actualiza los datos de contacto de un proveedor.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Proveedor> actualizarProveedor(@PathVariable Long id, @RequestBody Proveedor proveedorDetalles) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con el id: " + id));

        proveedor.setNombre(proveedorDetalles.getNombre());
        proveedor.setTelefono(proveedorDetalles.getTelefono());
        proveedor.setDireccion(proveedorDetalles.getDireccion());
        proveedor.setCorreo(proveedorDetalles.getCorreo());

        Proveedor proveedorActualizado = proveedorRepository.save(proveedor);
        return ResponseEntity.ok(proveedorActualizado);
    }

    /**
     * MÉTODO ELIMINAR: Elimina un proveedor de la base de datos.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProveedor(@PathVariable Long id) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con el id: " + id));

        proveedorRepository.delete(proveedor);
        return ResponseEntity.noContent().build();
    }
}