
package com.enfermeria.gestion.Repositorios;

import com.enfermeria.gestion.Entidades.RegistroActividad;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RegistroActividadRepositorio
        extends JpaRepository<RegistroActividad, Long> {

    List<RegistroActividad> findByActividadIdOrderByFechaRegistroDesc(
        Long actividadId
    );

    boolean existsByActividadId(Long actividadId);
}
