package com.andres.odontologia_api.controlador;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.andres.odontologia_api.dto.PagoSolicitudDTO;
import com.andres.odontologia_api.dto.PagoActualizarDTO;
import com.andres.odontologia_api.dto.PagoRespuestaDTO;
import com.andres.odontologia_api.modelo.Pago;
import com.andres.odontologia_api.servicio.PagoServicio;

import jakarta.validation.Valid;

// Controlador REST para gestionar pagos odontologicos
@RestController
@RequestMapping("/api/pagos")
public class PagoControlador {

    // Servicio que contiene la logica de pagos
    private final PagoServicio pagoServicio;

    // Inyeccion de dependencias
    public PagoControlador(PagoServicio pagoServicio) {
        this.pagoServicio = pagoServicio;
    }

    // Convertir un pago a DTO
    private PagoRespuestaDTO convertirDTO(Pago pago) {

        return new PagoRespuestaDTO(
                pago.getId(),
                pago.getCita().getId(),
                pago.getMonto(),
                pago.getMetodoPago(),
                pago.getFechaPago(),
                pago.getEstado()
        );
    }

    // GET: listar todos los pagos
    // URL: GET /api/pagos
    @GetMapping
    public List<PagoRespuestaDTO> listar() {

        return pagoServicio.listar()
                .stream()
                .map(this::convertirDTO)
                .toList();
    }

    // GET: buscar un pago por ID
    // URL: GET /api/pagos/1
    @GetMapping("/{id}")
    public PagoRespuestaDTO buscar(@PathVariable Long id) {

        return convertirDTO(pagoServicio.buscarPorId(id));
    }

    // GET: buscar el pago de una cita
    // URL: GET /api/pagos/cita/1
    @GetMapping("/cita/{citaId}")
    public PagoRespuestaDTO buscarPorCita(
            @PathVariable Long citaId) {

        return convertirDTO(
                pagoServicio.buscarPorCita(citaId)
        );
    }

    // POST: registrar nuevo pago pendiente
    // URL: POST /api/pagos
    @PostMapping
    public ResponseEntity<PagoRespuestaDTO> guardar(
            @Valid @RequestBody PagoSolicitudDTO datos) {

        Pago pago = pagoServicio.guardar(
                datos.citaId(),
                datos.monto(),
                datos.metodoPago()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(convertirDTO(pago));
    }

    // PUT: actualizar un pago pendiente
    // URL: PUT /api/pagos/1
    @PutMapping("/{id}")
    public PagoRespuestaDTO actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PagoActualizarDTO datos) {

        Pago pago = pagoServicio.actualizar(
                id,
                datos.monto(),
                datos.metodoPago()
        );

        return convertirDTO(pago);
    }

    // PATCH: confirmar que un pago fue realizado
    // URL: PATCH /api/pagos/1/pagar
    @PatchMapping("/{id}/pagar")
    public PagoRespuestaDTO marcarPagado(
            @PathVariable Long id) {

        return convertirDTO(
                pagoServicio.marcarPagado(id)
        );
    }

    // PATCH: cancelar un pago pendiente
    // URL: PATCH /api/pagos/1/cancelar
    @PatchMapping("/{id}/cancelar")
    public PagoRespuestaDTO cancelar(
            @PathVariable Long id) {

        return convertirDTO(
                pagoServicio.cancelar(id)
        );
    }

    // DELETE: eliminar un pago permitido
    // URL: DELETE /api/pagos/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {

        pagoServicio.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}