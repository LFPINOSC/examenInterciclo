package ec.edu.ucacue.ordenes.repositorio;

import ec.edu.ucacue.ordenes.entidad.EstadoOrden;
import ec.edu.ucacue.ordenes.entidad.OrdenTrabajo;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrdenTrabajoRepository extends JpaRepository<OrdenTrabajo, Long> {

    List<OrdenTrabajo> findAllByOrderByIdDesc();

    /** Ordenes asignadas a un tecnico (un tecnico solo ve las suyas). */
    List<OrdenTrabajo> findByTecnicoIdOrderByIdDesc(Long tecnicoId);

    boolean existsByClienteId(Long clienteId);

    boolean existsByEquipoId(Long equipoId);

    boolean existsByTecnicoIdOrCreadoPorId(Long tecnicoId, Long creadoPorId);

    long countByEstado(EstadoOrden estado);

    long countByTecnicoIdAndEstado(Long tecnicoId, EstadoOrden estado);
}
