
package com.enfermeria.gestion.Repositorios;

import com.enfermeria.gestion.Entidades.Turno;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface TurnoRepositorio extends JpaRepository<Turno, Long> {

    List<Turno> findByEnfermeroId(Long enfermeroId);

    boolean existsByEnfermeroIdAndActivoTrueAndFechaInicioLessThanAndFechaFinGreaterThan(
        Long enfermeroId,
        LocalDateTime fechaFin,
        LocalDateTime fechaInicio
    );
}
