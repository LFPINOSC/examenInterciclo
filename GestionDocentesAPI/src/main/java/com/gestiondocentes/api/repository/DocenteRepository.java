package com.gestiondocentes.api.repository;

import com.gestiondocentes.api.entity.Docente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocenteRepository extends JpaRepository<Docente, Long> {
  boolean existsByCedulaIgnoreCase(String cedula);

  boolean existsByCorreoInstitucionalIgnoreCase(String correoInstitucional);
}
