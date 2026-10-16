package com.kevmarca.inventario.dto;

import java.math.BigDecimal;

/** Indicadores para la pantalla de inicio (dashboard). */
public record ResumenResponse(
        long totalProductos,
        long totalCategorias,
        long totalProveedores,
        long productosStockBajo,
        BigDecimal valorInventario
) {}
