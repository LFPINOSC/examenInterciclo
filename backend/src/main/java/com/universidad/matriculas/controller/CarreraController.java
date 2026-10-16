package com.universidad.matriculas.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.universidad.matriculas.model.Carrera;
import com.universidad.matriculas.service.CarreraService;

/**
 * API REST para administrar carreras.
 */
@RestController
@RequestMapping("/api/carreras")
public class CarreraController {

    private final CarreraService carreraService;

    public CarreraController(
            CarreraService carreraService
    ) {
        this.carreraService = carreraService;
    }

    /**
     * ADMIN y ESTUDIANTE pueden consultar carreras.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ESTUDIANTE')")
    public List<Carrera> listar() {

        return carreraService.listar();
    }

    /**
     * ADMIN y ESTUDIANTE pueden consultar
     * una carrera específica.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ESTUDIANTE')")
    public ResponseEntity<?> buscar(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    carreraService.buscarPorId(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "mensaje",
                                    e.getMessage()
                            )
                    );
        }
    }

    /**
     * Solo ADMIN puede crear carreras.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> guardar(
            @RequestBody Carrera carrera
    ) {

        try {

            Carrera guardada =
                    carreraService.guardar(carrera);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(guardada);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "mensaje",
                                    e.getMessage()
                            )
                    );
        }
    }

    /**
     * Solo ADMIN puede actualizar.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> actualizar(
            @PathVariable Long id,
            @RequestBody Carrera carrera
    ) {

        try {

            return ResponseEntity.ok(
                    carreraService.actualizar(
                            id,
                            carrera
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "mensaje",
                                    e.getMessage()
                            )
                    );
        }
    }

    /**
     * Solo ADMIN puede eliminar.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminar(
            @PathVariable Long id
    ) {

        try {

            carreraService.eliminar(id);

            return ResponseEntity.ok(
                    Map.of(
                            "mensaje",
                            "Carrera eliminada correctamente."
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "mensaje",
                                    e.getMessage()
                            )
                    );
        }
    }
}