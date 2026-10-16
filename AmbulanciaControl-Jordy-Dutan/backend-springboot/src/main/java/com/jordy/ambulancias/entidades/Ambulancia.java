package com.jordy.ambulancias.entidades;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
@Entity @Table(name="ambulancias") public class Ambulancia {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
  @NotBlank @Column(unique=true) public String placa;
  @NotBlank public String codigo;
  @NotBlank public String tipo;
  @NotBlank public String estado;
}
