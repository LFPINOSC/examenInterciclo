package com.sistema.tecnosoporte.entidades;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.math.BigDecimal;
import com.sistema.tecnosoporte.enums.TipoEquipo;

@Entity
@Table(name="equipos")
public class Equipo {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="cliente_id",nullable=false)
  private Usuario cliente;
  @Enumerated(EnumType.STRING) @Column(nullable=false,length=25)
  private TipoEquipo tipo;
  @Column(nullable=false,length=80)
  private String marca;
  @Column(nullable=false,length=100)
  private String modelo;
  @Column(name="numero_serie",length=100,unique=true)
  private String numeroSerie;
  @Column(columnDefinition="text")
  private String descripcion;
  @Column(nullable=false)
  private boolean activo;
  @Column(nullable=false,updatable=false)
  private OffsetDateTime fechaRegistro;
  @PrePersist public void crear() { if (fechaRegistro == null) fechaRegistro=OffsetDateTime.now(); }
  public Long getId() { return id; }
  public void setId(Long v) { this.id=v; }
  public Usuario getCliente() { return cliente; }
  public void setCliente(Usuario v) { this.cliente=v; }
  public TipoEquipo getTipo() { return tipo; }
  public void setTipo(TipoEquipo v) { this.tipo=v; }
  public String getMarca() { return marca; }
  public void setMarca(String v) { this.marca=v; }
  public String getModelo() { return modelo; }
  public void setModelo(String v) { this.modelo=v; }
  public String getNumeroSerie() { return numeroSerie; }
  public void setNumeroSerie(String v) { this.numeroSerie=v; }
  public String getDescripcion() { return descripcion; }
  public void setDescripcion(String v) { this.descripcion=v; }
  public boolean isActivo() { return activo; }
  public void setActivo(boolean v) { this.activo=v; }
  public OffsetDateTime getFechaRegistro() { return fechaRegistro; }
  public void setFechaRegistro(OffsetDateTime v) { this.fechaRegistro=v; }
}