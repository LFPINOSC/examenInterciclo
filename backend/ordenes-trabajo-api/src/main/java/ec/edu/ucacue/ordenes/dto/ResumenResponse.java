package ec.edu.ucacue.ordenes.dto;

import java.util.Map;

/** Cantidad de ordenes por estado (para el tablero de inicio). */
public record ResumenResponse(Map<String, Long> porEstado) {
}
