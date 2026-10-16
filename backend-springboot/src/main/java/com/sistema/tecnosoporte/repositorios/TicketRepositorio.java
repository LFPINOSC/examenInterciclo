package com.sistema.tecnosoporte.repositorios;
import com.sistema.tecnosoporte.entidades.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface TicketRepositorio extends JpaRepository<Ticket,Long> { List<Ticket> findByEquipoClienteId(Long clienteId); boolean existsByEquipoId(Long id); boolean existsByTecnicoId(Long id); }
