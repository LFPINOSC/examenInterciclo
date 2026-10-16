package com.andres.odontologia_api.repositorio;

import com.andres.odontologia_api.modelo.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Repositorio para acceder a la tabla pacientes
public interface PacienteRepositorio extends JpaRepository<Paciente, Long> {

    // Buscar un paciente por su cedula
    Optional<Paciente> findByCedula(String cedula);

    // Verificar que no exista una cedula duplicada
    boolean existsByCedula(String cedula);
}