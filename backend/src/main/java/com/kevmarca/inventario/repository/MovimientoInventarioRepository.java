package com.kevmarca.inventario.repository;

import com.kevmarca.inventario.model.MovimientoInventario;
import com.kevmarca.inventario.model.TipoMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

// 📌 Consultas de movimientos
public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {
    List<MovimientoInventario> findAllByOrderByFechaDesc();
    List<MovimientoInventario> findByProductoIdOrderByFechaDesc(Long productoId);
    boolean existsByProductoId(Long productoId);
    boolean existsByUsuarioId(Long usuarioId);

    /** Movimientos de un tipo (p. ej. SALIDA = ventas) desde una fecha; lo usa el reporte de ventas. */
    List<MovimientoInventario> findByTipoAndFechaGreaterThanEqualOrderByFechaDesc(TipoMovimiento tipo, LocalDateTime desde);
}
