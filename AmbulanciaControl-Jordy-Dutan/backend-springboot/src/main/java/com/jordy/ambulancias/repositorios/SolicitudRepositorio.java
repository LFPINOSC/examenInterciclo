package com.jordy.ambulancias.repositorios;
import com.jordy.ambulancias.entidades.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface SolicitudRepositorio extends JpaRepository<Solicitud,Long> {}
