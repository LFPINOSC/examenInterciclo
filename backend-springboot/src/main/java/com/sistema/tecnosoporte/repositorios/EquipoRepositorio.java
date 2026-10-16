package com.sistema.tecnosoporte.repositorios;
import com.sistema.tecnosoporte.entidades.Equipo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface EquipoRepositorio extends JpaRepository<Equipo,Long> { List<Equipo> findByClienteId(Long clienteId); Optional<Equipo> findByNumeroSerieIgnoreCase(String serie); }
