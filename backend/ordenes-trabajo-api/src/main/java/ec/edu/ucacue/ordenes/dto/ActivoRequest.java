package ec.edu.ucacue.ordenes.dto;

import jakarta.validation.constraints.NotNull;

public record ActivoRequest(@NotNull(message = "Indique si la cuenta esta activa") Boolean activo) {
}
