package com.universidad.matriculas.model;

import jakarta.persistence.*;

/**
 * Entidad que representa una carrera universitaria.
 */
@Entity
@Table(name = "carreras")
public class Carrera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nombre único de la carrera
    @Column(nullable = false, unique = true, length = 120)
    private String nombre;

    // Información adicional de la carrera
    @Column(length = 255)
    private String descripcion;

    // Permite activar o desactivar la carrera
    @Column(nullable = false)
    private Boolean activa = true;

    public Carrera() {
    }

    public Carrera(
            Long id,
            String nombre,
            String descripcion,
            Boolean activa
    ) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.activa = activa;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Boolean getActiva() {
        return activa;
    }

    public void setActiva(Boolean activa) {
        this.activa = activa;
    }
}