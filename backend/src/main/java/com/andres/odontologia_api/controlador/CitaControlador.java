package com.andres.odontologia_api.controlador;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.andres.odontologia_api.dto.CitaSolicitudDTO;
import com.andres.odontologia_api.dto.CitaRespuestaDTO;
import com.andres.odontologia_api.dto.EstadoCitaDTO;
import com.andres.odontologia_api.modelo.Cita;
import com.andres.odontologia_api.servicio.CitaServicio;

import jakarta.validation.Valid;

// Controlador REST para gestionar citas odontologicas
@RestController
@RequestMapping("/api/citas")
public class CitaControlador {

    // Servicio que ejecuta la logica de negocio
    private final CitaServicio citaServicio;

    // Inyeccion de dependencias mediante constructor
    public CitaControlador(CitaServicio citaServicio) {
        this.citaServicio = citaServicio;
    }

    // Convertir entidad Cita a DTO
    // Devuelve solo los datos necesarios para Angular
    private CitaRespuestaDTO convertirDTO(Cita cita) {

        return new CitaRespuestaDTO(
                cita.getId(),
                cita.getPaciente().getId(),
                cita.getOdontologo().getId(),
                cita.getServicio().getId(),
                cita.getFechaHora(),
                cita.getEstado(),
                cita.getObservaciones()
        );
    }

    // GET: listar todas las citas
    // URL: GET /api/citas
    @GetMapping
    public List<CitaRespuestaDTO> listar() {

        return citaServicio.listar()
                .stream()
                .map(this::convertirDTO)
                .toList();
    }

    // GET: buscar una cita por ID
    // URL: GET /api/citas/1
    @GetMapping("/{id}")
    public CitaRespuestaDTO buscar(@PathVariable Long id) {

        return convertirDTO(citaServicio.buscarPorId(id));
    }

    // GET: listar las citas de un paciente
    // URL: GET /api/citas/paciente/1
    @GetMapping("/paciente/{pacienteId}")
    public List<CitaRespuestaDTO> listarPorPaciente(
            @PathVariable Long pacienteId) {

        return citaServicio.listarPorPaciente(pacienteId)
                .stream()
                .map(this::convertirDTO)
                .toList();
    }

    // GET: listar citas de un odontologo
    // URL: GET /api/citas/odontologo/1
    @GetMapping("/odontologo/{odontologoId}")
    public List<CitaRespuestaDTO> listarPorOdontologo(
            @PathVariable Long odontologoId) {

        return citaServicio.listarPorOdontologo(odontologoId)
                .stream()
                .map(this::convertirDTO)
                .toList();
    }

    // POST: registrar una cita nueva
    // URL: POST /api/citas
    @PostMapping
    public ResponseEntity<CitaRespuestaDTO> guardar(
            @Valid @RequestBody CitaSolicitudDTO datos) {

        Cita cita = citaServicio.guardar(
                datos.pacienteId(),
                datos.odontologoId(),
                datos.servicioId(),
                datos.fechaHora(),
                datos.observaciones()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(convertirDTO(cita));
    }

    // PUT: actualizar una cita existente
    // URL: PUT /api/citas/1
    @PutMapping("/{id}")
    public CitaRespuestaDTO actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CitaSolicitudDTO datos) {

        Cita cita = citaServicio.actualizar(
                id,
                datos.pacienteId(),
                datos.odontologoId(),
                datos.servicioId(),
                datos.fechaHora(),
                datos.observaciones()
        );

        return convertirDTO(cita);
    }

    // PATCH: cambiar el estado de la cita
    // URL: PATCH /api/citas/1/estado
    @PatchMapping("/{id}/estado")
    public CitaRespuestaDTO cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody EstadoCitaDTO datos) {

        Cita cita = citaServicio.cambiarEstado(
                id,
                datos.estado()
        );

        return convertirDTO(cita);
    }

    // DELETE: eliminar una cita
    // URL: DELETE /api/citas/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {

        citaServicio.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}