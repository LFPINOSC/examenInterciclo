package com.universidad.matriculas.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.universidad.matriculas.model.Asignatura;

/**
 * Repositorio encargado de las operaciones
 * sobre la tabla asignaturas.
 */
@Repository
public interface AsignaturaRepository
        extends JpaRepository<Asignatura, Long> {

    // Comprueba que el código no se repita
    boolean existsByCodigoIgnoreCase(String codigo);

    // Permite consultar materias de una carrera
    List<Asignatura> findByCarreraId(Long carreraId);
}