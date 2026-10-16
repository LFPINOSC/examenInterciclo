
package com.enfermeria.gestion.Repositorios;

import com.enfermeria.gestion.Entidades.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PacienteRepositorio extends JpaRepository<Paciente, Long> {

    Optional<Paciente> findByCedula(String cedula);

    boolean existsByCedula(String cedula);
}
