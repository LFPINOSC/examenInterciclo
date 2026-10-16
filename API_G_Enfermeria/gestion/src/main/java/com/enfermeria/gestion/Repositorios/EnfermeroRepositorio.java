
package com.enfermeria.gestion.Repositorios;

import com.enfermeria.gestion.Entidades.Enfermero;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EnfermeroRepositorio extends JpaRepository<Enfermero, Long> {

    Optional<Enfermero> findByCedula(String cedula);

    boolean existsByCedula(String cedula);

    boolean existsByNumeroLicencia(String numeroLicencia);

    boolean existsByUsuarioId(Long usuarioId);

    Optional<Enfermero> findByUsuarioId(Long usuarioId);
}
