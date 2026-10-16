package com.kevmarca.inventario.exception;

/** Se lanza cuando un registro buscado por id no existe (HTTP 404). */
public class RecursoNoEncontradoException extends RuntimeException {
    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
