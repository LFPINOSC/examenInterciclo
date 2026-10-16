package ec.edu.ucacue.ordenes.repositorio;

import ec.edu.ucacue.ordenes.entidad.Equipo;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EquipoRepository extends JpaRepository<Equipo, Long> {

    List<Equipo> findByClienteIdOrderByTipo(Long clienteId);

    boolean existsByClienteId(Long clienteId);

    boolean existsBySerie(String serie);

    boolean existsBySerieAndIdNot(String serie, Long id);
}
