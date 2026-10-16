package com.gestiondocentes.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "carreras")
public class Carrera {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank
  @Column(nullable = false, unique = true, length = 20)
  private String codigo;

  @NotBlank
  @Column(nullable = false, unique = true, length = 140)
  private String nombre;

  @Size(max = 300)
  @Column(length = 300)
  private String descripcion;

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

  public String getDescripcion() {
    return descripcion;
  }

  public void setDescripcion(String v) {
    descripcion = v;
  }

  public boolean isActiva() {
    return activa;
  }

  public void setActiva(boolean v) {
    activa = v;
  }
}
