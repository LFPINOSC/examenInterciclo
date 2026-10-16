package com.universidad.matriculas.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.universidad.matriculas.model.Matricula;

/**
 * Repositorio de matrículas.
 */
@Repository
public interface MatriculaRepository
        extends JpaRepository<Matricula, Long> {

    /**
     * Obtiene únicamente las matrículas
     * pertenecientes al usuario autenticado.
     */
    List<Matricula> findByEstudianteUsuarioCorreo(
            String correo
    );
}