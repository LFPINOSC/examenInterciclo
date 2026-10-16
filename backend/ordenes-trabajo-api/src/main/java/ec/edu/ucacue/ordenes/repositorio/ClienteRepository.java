package ec.edu.ucacue.ordenes.repositorio;

import ec.edu.ucacue.ordenes.entidad.Cliente;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    boolean existsByCedula(String cedula);

    boolean existsByCedulaAndIdNot(String cedula, Long id);

    List<Cliente> findByNombreContainingIgnoreCaseOrCedulaContainingOrderByNombre(String nombre, String cedula);
}
