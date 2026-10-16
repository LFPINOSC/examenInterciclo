package com.sistema.tecnosoporte.repositorios;
import com.sistema.tecnosoporte.entidades.DetalleServicio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface DetalleServicioRepositorio extends JpaRepository<DetalleServicio,Long> { List<DetalleServicio> findByTicketIdOrderByIdAsc(Long id); boolean existsByServicioId(Long id); }
