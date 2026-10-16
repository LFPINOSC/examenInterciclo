package com.jordy.ambulancias.entidades;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
@Entity @Table(name="conductores") public class Conductor {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
  @NotBlank public String nombre;
  @NotBlank @Column(unique=true) public String licencia;
  @NotBlank public String telefono;
  @NotBlank public String estado;
}
