package com.sistema.tecnosoporte.repositorios;
import com.sistema.tecnosoporte.entidades.Tecnico;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface TecnicoRepositorio extends JpaRepository<Tecnico,Long> { List<Tecnico> findByActivoTrue(); }
