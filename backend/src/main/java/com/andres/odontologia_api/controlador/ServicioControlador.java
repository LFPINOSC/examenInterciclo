package com.andres.odontologia_api.controlador;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.andres.odontologia_api.modelo.Servicio;
import com.andres.odontologia_api.servicio.ServicioServicio;

import jakarta.validation.Valid;

// Controlador REST para los tratamientos odontologicos
@RestController
@RequestMapping("/api/servicios")
public class ServicioControlador {

    // Conexion con la capa de servicios
    private final ServicioServicio servicioServicio;

    // Constructor para inyectar dependencias
    public ServicioControlador(
            ServicioServicio servicioServicio) {

        this.servicioServicio = servicioServicio;
    }

    // GET: listar los tratamientos disponibles
    @GetMapping
    public List<Servicio> listar() {

        return servicioServicio.listar();
    }

    // GET: buscar tratamiento por su ID
    @GetMapping("/{id}")
    public Servicio buscar(@PathVariable Long id) {

        return servicioServicio.buscarPorId(id);
    }

    // POST: registrar un tratamiento nuevo
    @PostMapping
    public ResponseEntity<Servicio> guardar(
            @Valid @RequestBody Servicio servicio) {

        Servicio guardado =
                servicioServicio.guardar(servicio);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(guardado);
    }

    // PUT: actualizar nombre, descripcion y precio
    @PutMapping("/{id}")
    public Servicio actualizar(
            @PathVariable Long id,
            @Valid @RequestBody Servicio datos) {

        return servicioServicio.actualizar(id, datos);
    }

    // DELETE: eliminar tratamiento por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {

        servicioServicio.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}