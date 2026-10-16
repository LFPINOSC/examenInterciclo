package com.andres.odontologia_api.controlador;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.andres.odontologia_api.modelo.Odontologo;
import com.andres.odontologia_api.servicio.OdontologoServicio;

import jakarta.validation.Valid;

// Controlador REST para administrar odontologos
@RestController
@RequestMapping("/api/odontologos")
public class OdontologoControlador {

    // Servicio que contiene la logica del CRUD
    private final OdontologoServicio odontologoServicio;

    // Constructor para inyectar el servicio
    public OdontologoControlador(
            OdontologoServicio odontologoServicio) {

        this.odontologoServicio = odontologoServicio;
    }

    // GET: listar todos los odontologos
    @GetMapping
    public List<Odontologo> listar() {

        return odontologoServicio.listar();
    }

    // GET: buscar odontologo por ID
    @GetMapping("/{id}")
    public Odontologo buscar(@PathVariable Long id) {

        return odontologoServicio.buscarPorId(id);
    }

    // POST: registrar nuevo odontologo
    @PostMapping
    public ResponseEntity<Odontologo> guardar(
            @Valid @RequestBody Odontologo odontologo) {

        Odontologo guardado =
                odontologoServicio.guardar(odontologo);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(guardado);
    }

    // PUT: actualizar odontologo existente
    @PutMapping("/{id}")
    public Odontologo actualizar(
            @PathVariable Long id,
            @Valid @RequestBody Odontologo datos) {

        return odontologoServicio.actualizar(id, datos);
    }

    // DELETE: eliminar odontologo
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {

        odontologoServicio.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}