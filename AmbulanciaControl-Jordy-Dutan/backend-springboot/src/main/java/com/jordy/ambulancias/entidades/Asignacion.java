package com.jordy.ambulancias.entidades;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
@Entity @Table(name="asignaciones") public class Asignacion {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
  @NotNull @Column(name="solicitud_id",unique=true) public Long solicitudId;
  @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="solicitud_id",insertable=false,updatable=false) @com.fasterxml.jackson.annotation.JsonIgnore public Solicitud solicitud;
  @NotNull @Column(name="ambulancia_id") public Long ambulanciaId;
  @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="ambulancia_id",insertable=false,updatable=false) @com.fasterxml.jackson.annotation.JsonIgnore public Ambulancia ambulancia;
  @NotNull @Column(name="conductor_id") public Long conductorId;
  @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="conductor_id",insertable=false,updatable=false) @com.fasterxml.jackson.annotation.JsonIgnore public Conductor conductor;
  @NotBlank public String estado;
   public String observaciones;
}
