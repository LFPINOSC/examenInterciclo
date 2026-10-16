package com.sistema.tecnosoporte.entidades;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.math.BigDecimal;

@Entity
@Table(name="tecnicos")
public class Tecnico {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  @Column(nullable=false,length=80)
  private String nombre;
  @Column(nullable=false,length=80)
  private String apellido;
  @Column(nullable=false,length=120)
  private String especialidad;
  @Column(length=10)
  private String telefono;
  @Column(nullable=false)
  private boolean activo;
  @Column(nullable=false,updatable=false)
  private OffsetDateTime fechaRegistro;
  @PrePersist public void crear() { if (fechaRegistro == null) fechaRegistro=OffsetDateTime.now(); }
  public Long getId() { return id; }
  public void setId(Long v) { this.id=v; }
  public String getNombre() { return nombre; }
  public void setNombre(String v) { this.nombre=v; }
  public String getApellido() { return apellido; }
  public void setApellido(String v) { this.apellido=v; }
  public String getEspecialidad() { return especialidad; }
  public void setEspecialidad(String v) { this.especialidad=v; }
  public String getTelefono() { return telefono; }
  public void setTelefono(String v) { this.telefono=v; }
  public boolean isActivo() { return activo; }
  public void setActivo(boolean v) { this.activo=v; }
  public OffsetDateTime getFechaRegistro() { return fechaRegistro; }
  public void setFechaRegistro(OffsetDateTime v) { this.fechaRegistro=v; }
}