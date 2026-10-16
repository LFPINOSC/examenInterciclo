package ec.edu.ucacue.ordenes.dto;

import ec.edu.ucacue.ordenes.entidad.EstadoOrden;
import ec.edu.ucacue.ordenes.entidad.Prioridad;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/** Alta/edicion de una orden (solo ADMIN). estado, prioridad y fechaIngreso son opcionales. */
public record OrdenRequest(
        @NotNull(message = "El cliente es obligatorio") Long clienteId,
        @NotNull(message = "El equipo es obligatorio") Long equipoId,
        Long tecnicoId,

        @NotBlank(message = "La descripcion es obligatoria")
        @Size(max = 500, message = "La descripcion no puede superar 500 caracteres")
        String descripcion,

        Prioridad prioridad,
        EstadoOrden estado,
        LocalDate fechaIngreso,
        LocalDate fechaEntrega) {
}
