package com.universidad.matriculas.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.universidad.matriculas.dto.AsignaturaRequest;
import com.universidad.matriculas.service.AsignaturaService;

/**
 * API REST para gestionar asignaturas.
 */
@RestController
@RequestMapping("/api/asignaturas")
public class AsignaturaController {

    private final AsignaturaService asignaturaService;

    public AsignaturaController(
            AsignaturaService asignaturaService
    ) {
        this.asignaturaService = asignaturaService;
    }

    /**
     * ADMIN y ESTUDIANTE pueden consultar.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ESTUDIANTE')")
    public ResponseEntity<?> listar() {

        return ResponseEntity.ok(
                asignaturaService.listar()
        );
    }

    /**
     * Consulta una asignatura por ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ESTUDIANTE')")
    public ResponseEntity<?> buscar(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    asignaturaService.buscarPorId(id)
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
     * Consulta asignaturas pertenecientes
     * a una carrera.
     */
    @GetMapping("/carrera/{carreraId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ESTUDIANTE')")
    public ResponseEntity<?> porCarrera(
            @PathVariable Long carreraId
    ) {

        return ResponseEntity.ok(
                asignaturaService
                        .listarPorCarrera(carreraId)
        );
    }

    /**
     * Solo ADMIN puede crear asignaturas.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> guardar(
            @RequestBody AsignaturaRequest request
    ) {

        try {

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            asignaturaService.guardar(request)
                    );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "mensaje",
                                    e.getMessage()
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
     * Solo ADMIN puede actualizar.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> actualizar(
            @PathVariable Long id,
            @RequestBody AsignaturaRequest request
    ) {

        try {

            return ResponseEntity.ok(
                    asignaturaService.actualizar(
                            id,
                            request
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

            asignaturaService.eliminar(id);

            return ResponseEntity.ok(
                    Map.of(
                            "mensaje",
                            "Asignatura eliminada correctamente."
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