package com.sistema.tecnosoporte.repositorios;
import com.sistema.tecnosoporte.entidades.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface ServicioRepositorio extends JpaRepository<Servicio,Long> { Optional<Servicio> findByNombreIgnoreCase(String nombre); List<Servicio> findByActivoTrue(); }
