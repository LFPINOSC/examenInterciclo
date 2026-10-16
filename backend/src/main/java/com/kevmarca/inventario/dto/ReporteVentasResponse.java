package com.kevmarca.inventario.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Reporte de ventas para el ADMIN.
 * Una venta es un movimiento de tipo SALIDA.
 *   ingresos = cantidad x precio de venta
 *   costo    = cantidad x precio de compra
 *   ganancia = ingresos - costo
 */
// 📌 Respuesta del reporte: totales + por día + top productos + por empleado + detalle
public record ReporteVentasResponse(
        int dias,
        Totales totales,
        List<VentaDia> porDia,
        List<ProductoVendido> topProductos,
        List<VentasEmpleado> porEmpleado,
        List<VentaDetalle> ventas
) {
    public record Totales(long ventas, long unidades, BigDecimal ingresos, BigDecimal costo,
                          BigDecimal ganancia, BigDecimal margenPorcentaje) {}

    public record VentaDia(LocalDate fecha, long unidades, BigDecimal ingresos, BigDecimal ganancia) {}

    public record ProductoVendido(String codigo, String nombre, long unidades, BigDecimal ingresos, BigDecimal ganancia) {}

    public record VentasEmpleado(String nombre, long ventas, long unidades, BigDecimal ingresos) {}

    public record VentaDetalle(Long id, LocalDateTime fecha, String producto, int cantidad,
                               BigDecimal precioUnitario, BigDecimal total, BigDecimal ganancia, String usuario) {}
}
