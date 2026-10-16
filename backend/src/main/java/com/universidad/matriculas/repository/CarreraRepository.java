package com.universidad.matriculas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.universidad.matriculas.model.Carrera;

/**
 * Repositorio para acceder a la tabla carreras.
 */
@Repository
public interface CarreraRepository
        extends JpaRepository<Carrera, Long> {

    // Comprueba si ya existe una carrera con ese nombre
    boolean existsByNombreIgnoreCase(String nombre);
}