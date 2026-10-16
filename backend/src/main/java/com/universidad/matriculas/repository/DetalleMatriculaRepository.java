package com.universidad.matriculas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.universidad.matriculas.model.DetalleMatricula;

/**
 * Repositorio para los detalles de matrícula.
 */
@Repository
public interface DetalleMatriculaRepository
        extends JpaRepository<DetalleMatricula, Long> {
}