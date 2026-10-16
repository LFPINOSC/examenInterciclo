package com.universidad.matriculas.controller;

import java.security.Principal;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.universidad.matriculas.dto.MatriculaRequest;
import com.universidad.matriculas.service.MatriculaService;

/**
 * API REST para gestión de matrículas.
 */
@RestController
@RequestMapping("/api/matriculas")
public class MatriculaController {

    private final MatriculaService matriculaService;

    public MatriculaController(
            MatriculaService matriculaService
    ) {
        this.matriculaService = matriculaService;
    }

    /**
     * ADMIN consulta todas las matrículas.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> listar() {

        return ResponseEntity.ok(
                matriculaService.listar()
        );
    }

    /**
     * ESTUDIANTE consulta solamente
     * sus propias matrículas.
     */
    @GetMapping("/mis-matriculas")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<?> misMatriculas(
            Principal principal
    ) {

        return ResponseEntity.ok(
                matriculaService.listarPropias(
                        principal.getName()
                )
        );
    }

    /**
     * ADMIN crea matrícula para cualquier estudiante.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> guardar(
            @RequestBody MatriculaRequest request
    ) {

        try {

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            matriculaService.guardar(
                                    request
                            )
                    );

        } catch (RuntimeException e) {

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
     * ESTUDIANTE crea una matrícula solamente
     * para su propia cuenta.
     */
    @PostMapping("/mi-matricula")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<?> guardarPropia(
            @RequestBody MatriculaRequest request,
            Principal principal
    ) {

        try {

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            matriculaService.guardarPropia(
                                    principal.getName(),
                                    request
                            )
                    );

        } catch (RuntimeException e) {

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
     * ESTUDIANTE cancela únicamente
     * una matrícula propia.
     */
    @PutMapping("/mis-matriculas/{id}/cancelar")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<?> cancelarPropia(
            @PathVariable Long id,
            Principal principal
    ) {

        try {

            return ResponseEntity.ok(
                    matriculaService.cancelarPropia(
                            id,
                            principal.getName()
                    )
            );

        } catch (RuntimeException e) {

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
     * Solo ADMIN elimina matrículas.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminar(
            @PathVariable Long id
    ) {

        try {

            matriculaService.eliminar(id);

            return ResponseEntity.ok(
                    Map.of(
                            "mensaje",
                            "Matrícula eliminada correctamente."
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