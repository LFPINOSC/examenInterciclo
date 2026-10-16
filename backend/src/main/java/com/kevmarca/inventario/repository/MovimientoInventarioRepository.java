package com.kevmarca.inventario.repository;

import com.kevmarca.inventario.model.MovimientoInventario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {
    List<MovimientoInventario> findAllByOrderByFechaDesc();
    List<MovimientoInventario> findByProductoIdOrderByFechaDesc(Long productoId);
    boolean existsByProductoId(Long productoId);
    boolean existsByUsuarioId(Long usuarioId);
}
