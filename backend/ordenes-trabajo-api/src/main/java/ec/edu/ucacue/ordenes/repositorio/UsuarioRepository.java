package ec.edu.ucacue.ordenes.repositorio;

import ec.edu.ucacue.ordenes.entidad.Rol;
import ec.edu.ucacue.ordenes.entidad.Usuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsername(String username);

    /** Permite iniciar sesion con el usuario o con el correo. */
    Optional<Usuario> findByUsernameIgnoreCaseOrCorreoIgnoreCase(String username, String correo);

    List<Usuario> findByRolAndActivoTrueOrderByNombre(Rol rol);

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByCorreoIgnoreCase(String correo);

    boolean existsByCorreoIgnoreCaseAndIdNot(String correo, Long id);
}
