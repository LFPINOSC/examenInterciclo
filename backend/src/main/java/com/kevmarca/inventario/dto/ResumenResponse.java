package com.kevmarca.inventario.dto;

import java.math.BigDecimal;

/** Indicadores para la pantalla de inicio (dashboard). */
// 📌 Respuesta de GET /api/resumen
public record ResumenResponse(
        long totalProductos,
        long totalCategorias,
        long totalProveedores,
        long productosStockBajo,
        BigDecimal valorInventario
) {}
