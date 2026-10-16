package ec.edu.ucacue.ordenes.dto;

import ec.edu.ucacue.ordenes.entidad.EstadoOrden;
import jakarta.validation.constraints.NotNull;

public record EstadoRequest(@NotNull(message = "El estado es obligatorio") EstadoOrden estado) {
}
