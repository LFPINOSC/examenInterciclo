package ec.edu.ucacue.ordenes.dto;

import java.math.BigDecimal;

public record TareaResponse(Long id, Long ordenId, String descripcion, BigDecimal horas, BigDecimal costo,
                            boolean completada) {
}
