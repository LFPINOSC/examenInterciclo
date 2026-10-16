package com.kevmarca.inventario.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// 📌 Tabla "categoria". Las validaciones (@NotBlank) se revisan con @Valid
@Entity
@Table(name = "categoria")
public class Categoria {

    // PK autoincremental
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 60, message = "El nombre admite máximo 60 caracteres")
    @Column(nullable = false, unique = true, length = 60)
    private String nombre;

    @Size(max = 255, message = "La descripción admite máximo 255 caracteres")
    private String descripcion;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}
