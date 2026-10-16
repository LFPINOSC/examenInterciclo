package com.universidad.matriculas.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;

/**
 * Representa la matrícula realizada por un estudiante
 * en un determinado período académico.
 */
@Entity
@Table(name = "matriculas")
public class Matricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false, length = 30)
    private String periodo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoMatricula estado;

    /**
     * Un estudiante puede tener varias matrículas.
     */
    @ManyToOne
    @JoinColumn(
            name = "estudiante_id",
            nullable = false
    )
    private Estudiante estudiante;

    /**
     * Una matrícula puede contener varias asignaturas.
     */
    @OneToMany(
            mappedBy = "matricula",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<DetalleMatricula> detalles =
            new ArrayList<>();

    public Matricula() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public String getPeriodo() {
        return periodo;
    }

    public void setPeriodo(String periodo) {
        this.periodo = periodo;
    }

    public EstadoMatricula getEstado() {
        return estado;
    }

    public void setEstado(EstadoMatricula estado) {
        this.estado = estado;
    }

    public Estudiante getEstudiante() {
        return estudiante;
    }

    public void setEstudiante(Estudiante estudiante) {
        this.estudiante = estudiante;
    }

    public List<DetalleMatricula> getDetalles() {
        return detalles;
    }

    public void setDetalles(
            List<DetalleMatricula> detalles
    ) {
        this.detalles = detalles;
    }
}