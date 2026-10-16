package com.universidad.matriculas.dto;

/**
 * Información resumida de una asignatura
 * incluida dentro de una matrícula.
 */
public class AsignaturaMatriculaResponse {

    private Long id;
    private String codigo;
    private String nombre;
    private Integer creditos;

    public AsignaturaMatriculaResponse(
            Long id,
            String codigo,
            String nombre,
            Integer creditos
    ) {
        this.id = id;
        this.codigo = codigo;
        this.nombre = nombre;
        this.creditos = creditos;
    }

    public Long getId() {
        return id;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getNombre() {
        return nombre;
    }

    public Integer getCreditos() {
        return creditos;
    }
}