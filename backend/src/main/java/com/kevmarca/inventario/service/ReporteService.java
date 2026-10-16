package com.kevmarca.inventario.service;

import com.kevmarca.inventario.dto.ReporteVentasResponse;
import com.kevmarca.inventario.dto.ReporteVentasResponse.*;
import com.kevmarca.inventario.model.MovimientoInventario;
import com.kevmarca.inventario.model.TipoMovimiento;
import com.kevmarca.inventario.repository.MovimientoInventarioRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

// 📌 Calcula el reporte de ventas: ingresos, costo, ganancia y margen
@Service
public class ReporteService {

    private final MovimientoInventarioRepository movimientoRepository;

    public ReporteService(MovimientoInventarioRepository movimientoRepository) {
        this.movimientoRepository = movimientoRepository;
    }

    /** @param dias 1 = solo hoy, 7 = últimos 7 días, 30 = últimos 30 días */
    public ReporteVentasResponse ventas(int dias) {
        LocalDate hoy = LocalDate.now();
        LocalDate desde = hoy.minusDays(dias - 1L);

        // Las ventas son las SALIDAS del inventario
        List<MovimientoInventario> ventas = movimientoRepository
                .findByTipoAndFechaGreaterThanEqualOrderByFechaDesc(TipoMovimiento.SALIDA, desde.atStartOfDay());

        long unidades = 0;
        BigDecimal ingresos = BigDecimal.ZERO;
        BigDecimal costo = BigDecimal.ZERO;

        // LinkedHashMap mantiene el orden de inserción (días en orden cronológico)
        Map<LocalDate, long[]> unidadesDia = new LinkedHashMap<>();
        Map<LocalDate, BigDecimal[]> dineroDia = new LinkedHashMap<>();
        for (LocalDate d = desde; !d.isAfter(hoy); d = d.plusDays(1)) {
            unidadesDia.put(d, new long[]{0});
            dineroDia.put(d, new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
        }

        Map<String, ProductoAcum> porProducto = new HashMap<>();
        Map<String, EmpleadoAcum> porEmpleado = new HashMap<>();
        List<VentaDetalle> detalle = new ArrayList<>();

        // Recorre cada venta y va sumando a los totales y grupos
        for (MovimientoInventario m : ventas) {
            BigDecimal precio = valor(m.getPrecioUnitario(), m.getProducto().getPrecioVenta());
            BigDecimal costoUnit = valor(m.getCostoUnitario(), m.getProducto().getPrecioCompra());
            BigDecimal cant = BigDecimal.valueOf(m.getCantidad());
            BigDecimal total = precio.multiply(cant);
            BigDecimal ganancia = precio.subtract(costoUnit).multiply(cant);

            unidades += m.getCantidad();
            ingresos = ingresos.add(total);
            costo = costo.add(costoUnit.multiply(cant));

            LocalDate dia = m.getFecha().toLocalDate();
            if (unidadesDia.containsKey(dia)) {
                unidadesDia.get(dia)[0] += m.getCantidad();
                BigDecimal[] d = dineroDia.get(dia);
                d[0] = d[0].add(total);
                d[1] = d[1].add(ganancia);
            }

            porProducto.computeIfAbsent(m.getProducto().getCodigo(),
                    c -> new ProductoAcum(c, m.getProducto().getNombre())).sumar(m.getCantidad(), total, ganancia);
            porEmpleado.computeIfAbsent(m.getUsuario().getNombre(), EmpleadoAcum::new).sumar(m.getCantidad(), total);

            detalle.add(new VentaDetalle(m.getId(), m.getFecha(), m.getProducto().getNombre(), m.getCantidad(),
                    precio, total, ganancia, m.getUsuario().getNombre()));
        }

        BigDecimal gananciaTotal = ingresos.subtract(costo);
        // margen % = ganancia / ingresos x 100 (si no hubo ventas, 0)
        BigDecimal margen = ingresos.signum() == 0 ? BigDecimal.ZERO
                : gananciaTotal.multiply(BigDecimal.valueOf(100)).divide(ingresos, 1, RoundingMode.HALF_UP);

        List<VentaDia> serie = new ArrayList<>();
        unidadesDia.forEach((d, u) -> serie.add(new VentaDia(d, u[0], dineroDia.get(d)[0], dineroDia.get(d)[1])));

        List<ProductoVendido> top = porProducto.values().stream()
                .sorted(Comparator.comparing((ProductoAcum p) -> p.ingresos).reversed())
                .limit(8)
                .map(p -> new ProductoVendido(p.codigo, p.nombre, p.unidades, p.ingresos, p.ganancia))
                .toList();

        List<VentasEmpleado> empleados = porEmpleado.values().stream()
                .sorted(Comparator.comparing((EmpleadoAcum e) -> e.ingresos).reversed())
                .map(e -> new VentasEmpleado(e.nombre, e.ventas, e.unidades, e.ingresos))
                .toList();

        Totales totales = new Totales(ventas.size(), unidades, ingresos, costo, gananciaTotal, margen);
        return new ReporteVentasResponse(dias, totales, serie, top, empleados, detalle);
    }

    private static BigDecimal valor(BigDecimal guardado, BigDecimal porDefecto) {
        return guardado != null ? guardado : porDefecto;
    }

    /** Acumuladores auxiliares para agrupar ventas. */
    private static class ProductoAcum {
        final String codigo;
        final String nombre;
        long unidades = 0;
        BigDecimal ingresos = BigDecimal.ZERO;
        BigDecimal ganancia = BigDecimal.ZERO;

        ProductoAcum(String codigo, String nombre) { this.codigo = codigo; this.nombre = nombre; }

        void sumar(int cantidad, BigDecimal total, BigDecimal gan) {
            unidades += cantidad;
            ingresos = ingresos.add(total);
            ganancia = ganancia.add(gan);
        }
    }

    private static class EmpleadoAcum {
        final String nombre;
        long ventas = 0;
        long unidades = 0;
        BigDecimal ingresos = BigDecimal.ZERO;

        EmpleadoAcum(String nombre) { this.nombre = nombre; }

        void sumar(int cantidad, BigDecimal total) {
            ventas++;
            unidades += cantidad;
            ingresos = ingresos.add(total);
        }
    }
}
