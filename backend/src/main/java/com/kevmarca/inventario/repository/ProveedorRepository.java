package com.kevmarca.inventario.repository;

import com.kevmarca.inventario.model.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
    boolean existsByRuc(String ruc);
    boolean existsByRucAndIdNot(String ruc, Long id);
}
