package com.jordy.ambulancias.entidades;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
@Entity @Table(name="usuarios") public class Usuario {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
  @Column(unique=true,nullable=false) public String correo;
  @NotBlank public String nombre;
   public String claveHash;
   public String rol;
}
