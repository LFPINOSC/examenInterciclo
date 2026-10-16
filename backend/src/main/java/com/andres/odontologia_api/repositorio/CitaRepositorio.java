package com.andres.odontologia_api.repositorio;

import com.andres.odontologia_api.modelo.Cita;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// Repositorio para gestionar las citas odontologicas
public interface CitaRepositorio extends JpaRepository<Cita, Long> {

    // Consultar todas las citas de un paciente
    List<Cita> findByPacienteId(Long pacienteId);

    // Consultar las citas asignadas a un odontologo
    List<Cita> findByOdontologoId(Long odontologoId);

    // Buscar citas por estado
    List<Cita> findByEstado(String estado);
}