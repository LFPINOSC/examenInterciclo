package com.universidad.matriculas.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.universidad.matriculas.model.Estudiante;

/**
 * Repositorio encargado del acceso
 * a la tabla estudiantes.
 */
@Repository
public interface EstudianteRepository
        extends JpaRepository<Estudiante, Long> {

    boolean existsByCedula(String cedula);

    boolean existsByUsuarioId(Long usuarioId);

    /**
     * Permite obtener el estudiante utilizando
     * el correo del usuario autenticado.
     */
    Optional<Estudiante> findByUsuarioCorreo(String correo);
}