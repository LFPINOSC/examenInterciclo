package com.kevmarca.inventario.dto;

import com.kevmarca.inventario.model.TipoMovimiento;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MovimientoRequest(
        @NotNull(message = "El tipo es obligatorio (ENTRADA o SALIDA)")
        TipoMovimiento tipo,

        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad debe ser al menos 1")
        Integer cantidad,

        @Size(max = 200, message = "El motivo admite máximo 200 caracteres")
        String motivo,

        @NotNull(message = "Debe seleccionar un producto")
        Long productoId
) {}
