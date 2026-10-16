package ec.edu.ucacue.ordenes.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record OrdenResponse(Long id, String codigo, Long clienteId, String cliente, Long equipoId, String equipo,
                            Long tecnicoId, String tecnico, String descripcion, String prioridad, String estado,
                            LocalDate fechaIngreso, LocalDate fechaEntrega, BigDecimal costoTotal,
                            List<TareaResponse> tareas) {
}
