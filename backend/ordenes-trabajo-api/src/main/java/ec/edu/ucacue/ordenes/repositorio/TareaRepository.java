package ec.edu.ucacue.ordenes.repositorio;

import ec.edu.ucacue.ordenes.entidad.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TareaRepository extends JpaRepository<Tarea, Long> {
}
