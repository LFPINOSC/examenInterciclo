package com.jordy.ambulancias.repositorios;
import com.jordy.ambulancias.entidades.Conductor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface ConductorRepositorio extends JpaRepository<Conductor,Long> {}
