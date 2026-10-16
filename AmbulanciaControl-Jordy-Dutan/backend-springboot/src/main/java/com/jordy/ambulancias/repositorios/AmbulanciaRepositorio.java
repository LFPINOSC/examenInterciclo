package com.jordy.ambulancias.repositorios;
import com.jordy.ambulancias.entidades.Ambulancia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AmbulanciaRepositorio extends JpaRepository<Ambulancia,Long> {}
