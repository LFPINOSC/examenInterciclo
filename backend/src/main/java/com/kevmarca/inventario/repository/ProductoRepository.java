package com.kevmarca.inventario.repository;

import com.kevmarca.inventario.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

// 📌 Consultas de productos
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    boolean existsByCodigoIgnoreCase(String codigo);
    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, Long id);
    boolean existsByCategoriaId(Long categoriaId);
    boolean existsByProveedorId(Long proveedorId);

    List<Producto> findByNombreContainingIgnoreCaseOrCodigoContainingIgnoreCase(String nombre, String codigo);

    // @Query = consulta escrita a mano en JPQL (usa nombres de clases, no de tablas)
    @Query("SELECT p FROM Producto p WHERE p.stock <= p.stockMinimo")
    List<Producto> findConStockBajo();
}
