package com.gestiondocentes.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Entity
@Table(name = "periodos_academicos")
public class PeriodoAcademico {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank
  @Column(nullable = false, unique = true, length = 50)
  private String nombre;

  @NotNull
  @Column(nullable = false)
  private LocalDate fechaInicio;

  @NotNull
  @Column(nullable = false)
  private LocalDate fechaFin;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private EstadoPeriodo estado = EstadoPeriodo.PLANIFICADO;

  public Long getId() {
    return id;
  }

  public void setId(Long v) {
    id = v;
  }

  public String getNombre() {
    return nombre;
  }

  public void setNombre(String v) {
    nombre = v;
  }

  public LocalDate getFechaInicio() {
    return fechaInicio;
  }

  public void setFechaInicio(LocalDate v) {
    fechaInicio = v;
  }

  public LocalDate getFechaFin() {
    return fechaFin;
  }

  public void setFechaFin(LocalDate v) {
    fechaFin = v;
  }

  public EstadoPeriodo getEstado() {
    return estado;
  }

  public void setEstado(EstadoPeriodo v) {
    estado = v;
  }
}
