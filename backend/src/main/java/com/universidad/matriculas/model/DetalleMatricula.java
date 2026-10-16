package com.universidad.matriculas.model;

import jakarta.persistence.*;

/**
 * Relaciona una matrícula con las asignaturas
 * seleccionadas por el estudiante.
 */
@Entity
@Table(
        name = "detalle_matricula",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "matricula_id",
                                "asignatura_id"
                        }
                )
        }
)
public class DetalleMatricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Matrícula a la que pertenece el detalle.
     */
    @ManyToOne
    @JoinColumn(
            name = "matricula_id",
            nullable = false
    )
    private Matricula matricula;

    /**
     * Asignatura incluida en la matrícula.
     */
    @ManyToOne
    @JoinColumn(
            name = "asignatura_id",
            nullable = false
    )
    private Asignatura asignatura;

    public DetalleMatricula() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Matricula getMatricula() {
        return matricula;
    }

    public void setMatricula(Matricula matricula) {
        this.matricula = matricula;
    }

    public Asignatura getAsignatura() {
        return asignatura;
    }

    public void setAsignatura(Asignatura asignatura) {
        this.asignatura = asignatura;
    }
}