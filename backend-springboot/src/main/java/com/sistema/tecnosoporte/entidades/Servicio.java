package com.sistema.tecnosoporte.entidades;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.math.BigDecimal;

@Entity
@Table(name="servicios")
public class Servicio {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  @Column(nullable=false,length=120,unique=true)
  private String nombre;
  @Column(columnDefinition="text")
  private String descripcion;
  @Column(nullable=false,precision=10,scale=2)
  private BigDecimal precio;
  @Column(nullable=false)
  private boolean activo;
  @Column(nullable=false,updatable=false)
  private OffsetDateTime fechaRegistro;
  @PrePersist public void crear() { if (fechaRegistro == null) fechaRegistro=OffsetDateTime.now(); }
  public Long getId() { return id; }
  public void setId(Long v) { this.id=v; }
  public String getNombre() { return nombre; }
  public void setNombre(String v) { this.nombre=v; }
  public String getDescripcion() { return descripcion; }
  public void setDescripcion(String v) { this.descripcion=v; }
  public BigDecimal getPrecio() { return precio; }
  public void setPrecio(BigDecimal v) { this.precio=v; }
  public boolean isActivo() { return activo; }
  public void setActivo(boolean v) { this.activo=v; }
  public OffsetDateTime getFechaRegistro() { return fechaRegistro; }
  public void setFechaRegistro(OffsetDateTime v) { this.fechaRegistro=v; }
}