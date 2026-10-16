package com.gestiondocentes.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "asignaturas")
public class Asignatura {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank
  @Column(nullable = false, unique = true, length = 20)
  private String codigo;

  @NotBlank
  @Column(nullable = false, length = 120)
  private String nombre;

  @NotNull
  @Min(1)
  @Max(20)
  @Column(nullable = false)
  private Integer creditos;

  @NotNull
  @Min(1)
  @Max(40)
  @Column(nullable = false)
  private Integer horasSemanales;

  @Column(nullable = false)
  private boolean activa = true;

  public Long getId() {
    return id;
  }

  public void setId(Long v) {
    id = v;
  }

  public String getCodigo() {
    return codigo;
  }

  public void setCodigo(String v) {
    codigo = v;
  }

  public String getNombre() {
    return nombre;
  }

  public void setNombre(String v) {
    nombre = v;
  }

  public Integer getCreditos() {
    return creditos;
  }

  public void setCreditos(Integer v) {
    creditos = v;
  }

  public Integer getHorasSemanales() {
    return horasSemanales;
  }

  public void setHorasSemanales(Integer v) {
    horasSemanales = v;
  }

  public boolean isActiva() {
    return activa;
  }

  public void setActiva(boolean v) {
    activa = v;
  }
}
