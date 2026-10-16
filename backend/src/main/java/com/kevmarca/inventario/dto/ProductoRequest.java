package com.kevmarca.inventario.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

/** Datos que el frontend envía para crear o actualizar un producto. */
// 📌 Las anotaciones (@NotBlank, @Min...) validan antes de llegar al service
public record ProductoRequest(
        @NotBlank(message = "El código es obligatorio")
        @Size(max = 30, message = "El código admite máximo 30 caracteres")
        String codigo,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 120, message = "El nombre admite máximo 120 caracteres")
        String nombre,

        @Size(max = 255)
        String descripcion,

        @NotNull(message = "El precio de compra es obligatorio")
        @DecimalMin(value = "0.00", message = "El precio de compra no puede ser negativo")
        BigDecimal precioCompra,

        @NotNull(message = "El precio de venta es obligatorio")
        @DecimalMin(value = "0.01", message = "El precio de venta debe ser mayor a 0")
        BigDecimal precioVenta,

        @NotNull(message = "El stock es obligatorio")
        @Min(value = 0, message = "El stock no puede ser negativo")
        Integer stock,

        @NotNull(message = "El stock mínimo es obligatorio")
        @Min(value = 0, message = "El stock mínimo no puede ser negativo")
        Integer stockMinimo,

        @NotNull(message = "Debe seleccionar una categoría")
        Long categoriaId,

        @NotNull(message = "Debe seleccionar un proveedor")
        Long proveedorId,

        Boolean activo
) {}
