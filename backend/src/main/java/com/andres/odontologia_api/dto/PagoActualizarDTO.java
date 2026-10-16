package com.andres.odontologia_api.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.*;

// Datos editables de un pago pendiente
public record PagoActualizarDTO(

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.00")
    @Digits(integer = 8, fraction = 2)
    BigDecimal monto,

    @Size(max = 30)
    String metodoPago

) {}