package ec.edu.ucacue.ordenes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EquipoRequest(
        @NotNull(message = "El cliente es obligatorio") Long clienteId,

        @NotBlank(message = "El tipo es obligatorio")
        @Size(max = 60, message = "El tipo no puede superar 60 caracteres")
        String tipo,

        @Size(max = 60, message = "La marca no puede superar 60 caracteres") String marca,
        @Size(max = 60, message = "El modelo no puede superar 60 caracteres") String modelo,
        @Size(max = 60, message = "La serie no puede superar 60 caracteres") String serie) {
}
