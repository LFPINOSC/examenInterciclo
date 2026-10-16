package com.universidad.matriculas.model;

import jakarta.persistence.*;

/**
 * Entidad que representa una asignatura
 * perteneciente a una carrera universitaria.
 */
@Entity
@Table(name = "asignaturas")
public class Asignatura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Código único de la materia
    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    // Nombre de la asignatura
    @Column(nullable = false, length = 120)
    private String nombre;

    // Número de créditos académicos
    @Column(nullable = false)
    private Integer creditos;

    // Nivel o semestre al que pertenece
    @Column(nullable = false)
    private Integer nivel;

    // Permite activar o desactivar la asignatura
    @Column(nullable = false)
    private Boolean activa = true;

    /**
     * Muchas asignaturas pueden pertenecer
     * a una misma carrera.
     */
    @ManyToOne
    @JoinColumn(
            name = "carrera_id",
            nullable = false
    )
    private Carrera carrera;

    public Asignatura() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Integer getCreditos() {
        return creditos;
    }

    public void setCreditos(Integer creditos) {
        this.creditos = creditos;
    }

    public Integer getNivel() {
        return nivel;
    }

    public void setNivel(Integer nivel) {
        this.nivel = nivel;
    }

    public Boolean getActiva() {
        return activa;
    }

    public void setActiva(Boolean activa) {
        this.activa = activa;
    }

    public Carrera getCarrera() {
        return carrera;
    }

    public void setCarrera(Carrera carrera) {
        this.carrera = carrera;
    }
}