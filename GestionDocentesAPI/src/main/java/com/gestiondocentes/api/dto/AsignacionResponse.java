package com.gestiondocentes.api.dto;

public record AsignacionResponse(
    Long id,
    Long docenteId,
    String docente,
    Long asignaturaId,
    String asignatura,
    Long carreraId,
    String carrera,
    Long periodoId,
    String periodo,
    String paralelo,
    Integer horasAsignadas) {}
