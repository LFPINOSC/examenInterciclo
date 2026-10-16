package com.jordy.ambulancias.entidades;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
@Entity @Table(name="solicitudes") public class Solicitud {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
  @NotBlank public String paciente;
  @NotBlank public String telefono;
  @NotBlank public String origen;
  @NotBlank public String destino;
  @NotBlank public String prioridad;
  @NotBlank public String estado;
   public String observaciones;
   @Column(name="usuario_id",nullable=false) public Long usuarioId;
  @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="usuario_id",insertable=false,updatable=false) @com.fasterxml.jackson.annotation.JsonIgnore public Usuario usuario;
}
