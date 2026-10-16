
package com.enfermeria.gestion.Repositorios;

import com.enfermeria.gestion.Entidades.Actividad;
import com.enfermeria.gestion.Entidades.EstadoActividad;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActividadRepositorio extends JpaRepository<Actividad, Long> {

    List<Actividad> findByEnfermeroId(Long enfermeroId);

    List<Actividad> findByPacienteId(Long pacienteId);

    List<Actividad> findByEstado(EstadoActividad estado);

    boolean existsByPacienteId(Long pacienteId);

    boolean existsByEnfermeroId(Long enfermeroId);

    boolean existsByTurnoId(Long turnoId);
}
