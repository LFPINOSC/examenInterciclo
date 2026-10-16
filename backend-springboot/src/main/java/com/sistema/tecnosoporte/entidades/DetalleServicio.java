package com.sistema.tecnosoporte.entidades;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.math.BigDecimal;

@Entity
@Table(name="detalles_servicio", uniqueConstraints=@UniqueConstraint(name="uq_ticket_servicio",columnNames={"ticket_id","servicio_id"}))
public class DetalleServicio {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="ticket_id",nullable=false)
  private Ticket ticket;
  @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="servicio_id",nullable=false)
  private Servicio servicio;
  @Column(nullable=false,precision=10,scale=2)
  private BigDecimal precioAplicado;
  @Column(columnDefinition="text")
  private String observacion;
  @Column(nullable=false,updatable=false)
  private OffsetDateTime fechaRegistro;
  @PrePersist public void crear() { if (fechaRegistro == null) fechaRegistro=OffsetDateTime.now(); }
  public Long getId() { return id; }
  public void setId(Long v) { this.id=v; }
  public Ticket getTicket() { return ticket; }
  public void setTicket(Ticket v) { this.ticket=v; }
  public Servicio getServicio() { return servicio; }
  public void setServicio(Servicio v) { this.servicio=v; }
  public BigDecimal getPrecioAplicado() { return precioAplicado; }
  public void setPrecioAplicado(BigDecimal v) { this.precioAplicado=v; }
  public String getObservacion() { return observacion; }
  public void setObservacion(String v) { this.observacion=v; }
  public OffsetDateTime getFechaRegistro() { return fechaRegistro; }
  public void setFechaRegistro(OffsetDateTime v) { this.fechaRegistro=v; }
}