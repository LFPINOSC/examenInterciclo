package com.sistema.tecnosoporte.entidades;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.math.BigDecimal;
import com.sistema.tecnosoporte.enums.EstadoTicket;
import com.sistema.tecnosoporte.enums.Prioridad;

@Entity
@Table(name="tickets")
public class Ticket {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="equipo_id",nullable=false)
  private Equipo equipo;
  @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="tecnico_id")
  private Tecnico tecnico;
  @Column(nullable=false,columnDefinition="text")
  private String descripcionProblema;
  @Column(columnDefinition="text")
  private String diagnostico;
  @Column(columnDefinition="text")
  private String solucion;
  @Enumerated(EnumType.STRING) @Column(nullable=false,length=10)
  private Prioridad prioridad;
  @Enumerated(EnumType.STRING) @Column(nullable=false,length=15)
  private EstadoTicket estado;
  @Column(nullable=false,updatable=false)
  private OffsetDateTime fechaCreacion;
  @Column(nullable=false)
  private OffsetDateTime fechaActualizacion;
  @Column
  private OffsetDateTime fechaCierre;
  @PrePersist public void crearTicket() { if(fechaCreacion==null) fechaCreacion=OffsetDateTime.now(); fechaActualizacion=OffsetDateTime.now(); }
  @PreUpdate public void modificarTicket() { fechaActualizacion=OffsetDateTime.now(); }
  public Long getId() { return id; }
  public void setId(Long v) { this.id=v; }
  public Equipo getEquipo() { return equipo; }
  public void setEquipo(Equipo v) { this.equipo=v; }
  public Tecnico getTecnico() { return tecnico; }
  public void setTecnico(Tecnico v) { this.tecnico=v; }
  public String getDescripcionProblema() { return descripcionProblema; }
  public void setDescripcionProblema(String v) { this.descripcionProblema=v; }
  public String getDiagnostico() { return diagnostico; }
  public void setDiagnostico(String v) { this.diagnostico=v; }
  public String getSolucion() { return solucion; }
  public void setSolucion(String v) { this.solucion=v; }
  public Prioridad getPrioridad() { return prioridad; }
  public void setPrioridad(Prioridad v) { this.prioridad=v; }
  public EstadoTicket getEstado() { return estado; }
  public void setEstado(EstadoTicket v) { this.estado=v; }
  public OffsetDateTime getFechaCreacion() { return fechaCreacion; }
  public void setFechaCreacion(OffsetDateTime v) { this.fechaCreacion=v; }
  public OffsetDateTime getFechaActualizacion() { return fechaActualizacion; }
  public void setFechaActualizacion(OffsetDateTime v) { this.fechaActualizacion=v; }
  public OffsetDateTime getFechaCierre() { return fechaCierre; }
  public void setFechaCierre(OffsetDateTime v) { this.fechaCierre=v; }
}