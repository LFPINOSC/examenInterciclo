
package com.enfermeria.gestion.Controladores;

import com.enfermeria.gestion.DTO.RegistroActividadRequest;
import com.enfermeria.gestion.DTO.RegistroActividadResponse;
import com.enfermeria.gestion.Servicios.RegistroActividadServicio;
import com.enfermeria.gestion.Seguridad.UsuarioActualServicio;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registros")
public class RegistroActividadControlador {

    private final RegistroActividadServicio servicio;
    private final UsuarioActualServicio usuarioActual;

    public RegistroActividadControlador(
            RegistroActividadServicio servicio,
            UsuarioActualServicio usuarioActual) {
        this.servicio = servicio;
        this.usuarioActual = usuarioActual;
    }

    @GetMapping("/actividad/{actividadId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RegistroActividadResponse>> porActividad(
            @PathVariable Long actividadId) {
        return ResponseEntity.ok(
                servicio.porActividad(actividadId));
    }

    @PostMapping("/actividad/{actividadId}")
    @PreAuthorize("hasRole('ENFERMERO')")
    public ResponseEntity<RegistroActividadResponse> registrar(
            @PathVariable Long actividadId,
            @Valid @RequestBody RegistroActividadRequest datos) {

        Long usuarioId = usuarioActual.usuarioActualId();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(servicio.registrar(
                        actividadId, usuarioId, datos));
    }
}
