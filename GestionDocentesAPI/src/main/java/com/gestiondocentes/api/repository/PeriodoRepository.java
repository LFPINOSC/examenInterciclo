package com.gestiondocentes.api.repository;

import com.gestiondocentes.api.entity.PeriodoAcademico;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PeriodoRepository extends JpaRepository<PeriodoAcademico, Long> {
  boolean existsByNombreIgnoreCase(String nombre);
}
