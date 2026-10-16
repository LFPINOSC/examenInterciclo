package com.universidad.matriculas.dto;

import java.time.LocalDate;
import java.util.List;

/**
 * Información segura de una matrícula
 * enviada al frontend.
 */
public class MatriculaResponse {

    private Long id;
    private LocalDate fecha;
    private String periodo;
    private String estado;

    private Long estudianteId;
    private String estudiante;

    private List<AsignaturaMatriculaResponse> asignaturas;

    public MatriculaResponse(
            Long id,
            LocalDate fecha,
            String periodo,
            String estado,
            Long estudianteId,
            String estudiante,
            List<AsignaturaMatriculaResponse> asignaturas
    ) {
        this.id = id;
        this.fecha = fecha;
        this.periodo = periodo;
        this.estado = estado;
        this.estudianteId = estudianteId;
        this.estudiante = estudiante;
        this.asignaturas = asignaturas;
    }

    public Long getId() {
        return id;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public String getPeriodo() {
        return periodo;
    }

    public String getEstado() {
        return estado;
    }

    public Long getEstudianteId() {
        return estudianteId;
    }

    public String getEstudiante() {
        return estudiante;
    }

    public List<AsignaturaMatriculaResponse> getAsignaturas() {
        return asignaturas;
    }
}