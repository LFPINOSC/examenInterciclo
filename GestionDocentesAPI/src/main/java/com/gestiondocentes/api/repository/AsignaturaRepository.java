package com.gestiondocentes.api.repository;

import com.gestiondocentes.api.entity.Asignatura;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AsignaturaRepository extends JpaRepository<Asignatura, Long> {
  boolean existsByCodigoIgnoreCase(String codigo);
}
