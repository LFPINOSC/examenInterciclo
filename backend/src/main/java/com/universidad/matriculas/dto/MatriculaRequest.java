package com.universidad.matriculas.dto;

import java.util.List;

/**
 * Datos necesarios para registrar una matrícula.
 */
public class MatriculaRequest {

    private Long estudianteId;
    private String periodo;
    private List<Long> asignaturaIds;

    public MatriculaRequest() {
    }

    public Long getEstudianteId() {
        return estudianteId;
    }

    public void setEstudianteId(Long estudianteId) {
        this.estudianteId = estudianteId;
    }

    public String getPeriodo() {
        return periodo;
    }

    public void setPeriodo(String periodo) {
        this.periodo = periodo;
    }

    public List<Long> getAsignaturaIds() {
        return asignaturaIds;
    }

    public void setAsignaturaIds(
            List<Long> asignaturaIds
    ) {
        this.asignaturaIds = asignaturaIds;
    }
}