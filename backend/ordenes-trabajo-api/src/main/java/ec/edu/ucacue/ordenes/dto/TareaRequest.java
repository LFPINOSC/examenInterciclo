package ec.edu.ucacue.ordenes.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record TareaRequest(
        @NotBlank(message = "La descripcion es obligatoria")
        @Size(max = 200, message = "La descripcion no puede superar 200 caracteres")
        String descripcion,

        @NotNull(message = "Las horas son obligatorias")
        @DecimalMin(value = "0", message = "Las horas no pueden ser negativas")
        BigDecimal horas,

        @NotNull(message = "El costo es obligatorio")
        @DecimalMin(value = "0", message = "El costo no puede ser negativo")
        BigDecimal costo,

        Boolean completada) {
}
