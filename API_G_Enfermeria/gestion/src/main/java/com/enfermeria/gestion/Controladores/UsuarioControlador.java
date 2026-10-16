
package com.enfermeria.gestion.Controladores;

import com.enfermeria.gestion.DTO.UsuarioRequest;
import com.enfermeria.gestion.DTO.UsuarioResponse;
import com.enfermeria.gestion.Servicios.UsuarioServicio;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@PreAuthorize("hasRole('ADMIN')")
public class UsuarioControlador {

    private final UsuarioServicio servicio;

    public UsuarioControlador(UsuarioServicio servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listar() {
        return ResponseEntity.ok(servicio.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> obtener(
            @PathVariable Long id) {

        return ResponseEntity.ok(servicio.obtener(id));
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> crear(
            @Valid @RequestBody UsuarioRequest datos) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(servicio.crear(datos));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioRequest datos) {

        return ResponseEntity.ok(
                servicio.actualizar(id, datos));
    }

    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<Void> desactivar(
            @PathVariable Long id) {

        servicio.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}
