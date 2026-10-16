package com.jordy.ambulancias.repositorios;
import com.jordy.ambulancias.entidades.Asignacion;import org.springframework.data.jpa.repository.JpaRepository;
public interface AsignacionRepositorio extends JpaRepository<Asignacion,Long>{boolean existsBySolicitudId(Long solicitudId);}
