package com.gestiondocentes.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@Entity
@Table(name = "docentes")
public class Docente {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank
  @Pattern(regexp = "^\\d{10}$")
  @Column(nullable = false, unique = true, length = 10)
  private String cedula;

  @NotBlank
  @Size(max = 80)
  @Column(nullable = false, length = 80)
  private String nombres;

  @NotBlank
  @Size(max = 80)
  @Column(nullable = false, length = 80)
  private String apellidos;

  @NotBlank
  @Email
  @Column(nullable = false, unique = true, length = 150)
  private String correoInstitucional;

  @Pattern(regexp = "^09\\d{8}$")
  @Column(length = 10)
  private String telefono;

  @NotBlank
  @Size(max = 120)
  @Column(nullable = false, length = 120)
  private String titulo;

  @NotNull
  @Column(nullable = false)
  private LocalDate fechaIngreso;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private EstadoDocente estado = EstadoDocente.ACTIVO;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getCedula() {
    return cedula;
  }

  public void setCedula(String cedula) {
    this.cedula = cedula;
  }

  public String getNombres() {
    return nombres;
  }

  public void setNombres(String nombres) {
    this.nombres = nombres;
  }

  public String getApellidos() {
    return apellidos;
  }

  public void setApellidos(String apellidos) {
    this.apellidos = apellidos;
  }

  public String getCorreoInstitucional() {
    return correoInstitucional;
  }

  public void setCorreoInstitucional(String correoInstitucional) {
    this.correoInstitucional = correoInstitucional;
  }

  public String getTelefono() {
    return telefono;
  }

  public void setTelefono(String telefono) {
    this.telefono = telefono;
  }

  public String getTitulo() {
    return titulo;
  }

  public void setTitulo(String titulo) {
    this.titulo = titulo;
  }

  public LocalDate getFechaIngreso() {
    return fechaIngreso;
  }

  public void setFechaIngreso(LocalDate fechaIngreso) {
    this.fechaIngreso = fechaIngreso;
  }

  public EstadoDocente getEstado() {
    return estado;
  }

  public void setEstado(EstadoDocente estado) {
    this.estado = estado;
  }
}
