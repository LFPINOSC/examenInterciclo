package com.examen.citasmedicas.entidades;

/**
 * ==========================================
 * ENUMERACION DE ROLES DEL SISTEMA
 * CONTROL DE CITAS MEDICAS
 * ==========================================
 *
 * Define los tipos de usuarios que pueden
 * acceder a nuestra aplicacion.
 *
 * Un enum permite trabajar con valores
 * previamente definidos, evitando errores
 * por escribir nombres de roles incorrectos.
 *
 * ROLES:
 *
 * ADMIN:
 * - Administrar pacientes.
 * - Administrar medicos.
 * - Administrar citas.
 * - Gestionar cuentas de usuarios.
 *
 * RECEPCIONISTA:
 * - Consultar y registrar pacientes.
 * - Consultar medicos.
 * - Gestionar citas medicas.
 *
 * Los permisos reales se aplican mediante
 * Spring Security en SeguridadConfig.java.
 */
public enum Rol {

    /**
     * Administrador del sistema.
     * Tiene acceso a las funciones administrativas.
     */
    ADMIN,

    /**
     * Usuario encargado de gestionar
     * los registros y las citas medicas.
     */
    RECEPCIONISTA
}