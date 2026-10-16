package com.gestiondocentes.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(
    name = "asignaciones_docente",
    uniqueConstraints =
        @UniqueConstraint(
            columnNames = {"docente_id", "asignatura_id", "carrera_id", "periodo_id", "paralelo"}))
public class AsignacionDocente {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "docente_id", nullable = false)
  private Docente docente;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "asignatura_id", nullable = false)
  private Asignatura asignatura;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "carrera_id", nullable = false)
  private Carrera carrera;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "periodo_id", nullable = false)
  private PeriodoAcademico periodo;

  @NotBlank
  @Column(nullable = false, length = 10)
  private String paralelo;

  @NotNull
  @Min(1)
  @Max(40)
  @Column(nullable = false)
  private Integer horasAsignadas;

  public Long getId() {
    return id;
  }

  public void setId(Long v) {
    id = v;
  }

  public Docente getDocente() {
    return docente;
  }

  public void setDocente(Docente v) {
    docente = v;
  }

  public Asignatura getAsignatura() {
    return asignatura;
  }

  public void setAsignatura(Asignatura v) {
    asignatura = v;
  }

  public Carrera getCarrera() {
    return carrera;
  }

  public void setCarrera(Carrera v) {
    carrera = v;
  }

  public PeriodoAcademico getPeriodo() {
    return periodo;
  }

  public void setPeriodo(PeriodoAcademico v) {
    periodo = v;
  }

  public String getParalelo() {
    return paralelo;
  }

  public void setParalelo(String v) {
    paralelo = v;
  }

  public Integer getHorasAsignadas() {
    return horasAsignadas;
  }

  public void setHorasAsignadas(Integer v) {
    horasAsignadas = v;
  }
}
