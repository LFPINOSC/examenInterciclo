package com.kevmarca.inventario.exception;

/** Se lanza cuando se incumple una regla del negocio, p. ej. stock insuficiente (HTTP 400). */
public class ReglaNegocioException extends RuntimeException {
    public ReglaNegocioException(String mensaje) {
        super(mensaje);
    }
}
