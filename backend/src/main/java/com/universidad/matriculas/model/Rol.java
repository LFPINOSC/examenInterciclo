package com.universidad.matriculas.model;

/**
 * Roles disponibles dentro del sistema.
 *
 * ADMIN:
 * Puede administrar estudiantes, carreras,
 * asignaturas y todas las matrículas.
 *
 * ESTUDIANTE:
 * Puede consultar información permitida
 * y gestionar únicamente sus matrículas.
 */
public enum Rol {

    ADMIN,
    ESTUDIANTE

}