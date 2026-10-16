package com.gestiondocentes.api.repository;

import com.gestiondocentes.api.entity.Carrera;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarreraRepository extends JpaRepository<Carrera, Long> {
  boolean existsByCodigoIgnoreCase(String codigo);

  boolean existsByNombreIgnoreCase(String nombre);
}
