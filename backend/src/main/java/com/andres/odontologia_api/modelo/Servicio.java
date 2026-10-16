package com.andres.odontologia_api.modelo;

import java.math.BigDecimal;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

// Representa los tratamientos odontológicos
@Entity
@Table(name = "servicios")
public class Servicio {

    // Identificador generado automáticamente
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nombre del tratamiento
    @NotBlank(message = "El nombre es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;

    // Descripción del tratamiento
    @Column(length = 255)
    private String descripcion;

    // Precio del tratamiento
    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.0", message = "El precio no puede ser negativo")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    // Constructor vacío requerido por JPA
    public Servicio() {
    }

    // Obtener y modificar el ID
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // Obtener y modificar el nombre
    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    // Obtener y modificar la descripción
    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    // Obtener y modificar el precio
    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }
}