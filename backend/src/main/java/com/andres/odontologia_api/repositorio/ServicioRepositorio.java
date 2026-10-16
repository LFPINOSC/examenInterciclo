package com.andres.odontologia_api.repositorio;

import com.andres.odontologia_api.modelo.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;

// Repositorio para acceder a los servicios odontologicos
public interface ServicioRepositorio extends JpaRepository<Servicio, Long> {

    // Permite registrar, consultar, actualizar
    // y eliminar tratamientos odontologicos.
}