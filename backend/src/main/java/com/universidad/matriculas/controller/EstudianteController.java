package com.universidad.matriculas.controller;

import java.security.Principal;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.universidad.matriculas.dto.EstudianteRequest;
import com.universidad.matriculas.service.EstudianteService;

/**
 * API REST para la gestión de estudiantes.
 */
@RestController
@RequestMapping("/api/estudiantes")
public class EstudianteController {

    private final EstudianteService estudianteService;

    public EstudianteController(
            EstudianteService estudianteService
    ) {
        this.estudianteService = estudianteService;
    }

    /**
     * Solo ADMIN puede listar
     * todos los estudiantes.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> listar() {

        return ResponseEntity.ok(
                estudianteService.listar()
        );
    }

    /**
     * El estudiante autenticado puede consultar
     * únicamente su propio perfil.
     */
    @GetMapping("/mi-perfil")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<?> miPerfil(
            Principal principal
    ) {

        try {

            return ResponseEntity.ok(
                    estudianteService.buscarPorCorreo(
                            principal.getName()
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
     * Solo ADMIN puede consultar por ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> buscar(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    estudianteService.buscarPorId(id)
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
     * Solo ADMIN crea perfiles de estudiante.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> guardar(
            @RequestBody EstudianteRequest request
    ) {

        try {

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            estudianteService.guardar(request)
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
     * Solo ADMIN puede editar.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> actualizar(
            @PathVariable Long id,
            @RequestBody EstudianteRequest request
    ) {

        try {

            return ResponseEntity.ok(
                    estudianteService.actualizar(
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

            estudianteService.eliminar(id);

            return ResponseEntity.ok(
                    Map.of(
                            "mensaje",
                            "Estudiante eliminado correctamente."
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