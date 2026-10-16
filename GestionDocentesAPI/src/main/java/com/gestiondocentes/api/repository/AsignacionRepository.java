package com.gestiondocentes.api.repository;

import com.gestiondocentes.api.entity.AsignacionDocente;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface AsignacionRepository extends JpaRepository<AsignacionDocente, Long> {
  @EntityGraph(attributePaths = {"docente", "asignatura", "carrera", "periodo"})
  List<AsignacionDocente> findAll();

  @Query(
      "select count(a)>0 from AsignacionDocente a where a.docente.id=:d and a.asignatura.id=:a and a.carrera.id=:c and a.periodo.id=:p and upper(a.paralelo)=upper(:par) and (:id is null or a.id<>:id)")
  boolean duplicada(
      @Param("d") Long d,
      @Param("a") Long a,
      @Param("c") Long c,
      @Param("p") Long p,
      @Param("par") String par,
      @Param("id") Long id);
}
