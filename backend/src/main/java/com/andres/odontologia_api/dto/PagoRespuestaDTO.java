package com.andres.odontologia_api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Informacion que la API devuelve sobre un pago
public record PagoRespuestaDTO(

    Long id,
    Long citaId,
    BigDecimal monto,
    String metodoPago,
    LocalDateTime fechaPago,
    String estado

) {}