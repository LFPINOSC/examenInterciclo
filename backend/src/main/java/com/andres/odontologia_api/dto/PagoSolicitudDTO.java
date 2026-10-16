package com.andres.odontologia_api.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.*;

// Datos necesarios para registrar un nuevo pago
public record PagoSolicitudDTO(

    @NotNull(message = "La cita es obligatoria")
    @Positive(message = "El ID de la cita debe ser positivo")
    Long citaId,

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.00")
    @Digits(integer = 8, fraction = 2)
    BigDecimal monto,

    @Size(max = 30)
    String metodoPago

) {}