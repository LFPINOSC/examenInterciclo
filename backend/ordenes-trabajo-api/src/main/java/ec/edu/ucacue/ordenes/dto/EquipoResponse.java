package ec.edu.ucacue.ordenes.dto;

public record EquipoResponse(Long id, Long clienteId, String cliente, String tipo, String marca,
                             String modelo, String serie) {
}
