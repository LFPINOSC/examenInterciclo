package com.kevmarca.inventario.repository;

import com.kevmarca.inventario.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

// 📌 Consultas de categorías (el SQL lo genera Spring por el nombre del método)
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    boolean existsByNombreIgnoreCase(String nombre);
    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);
}
