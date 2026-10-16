package ec.edu.ucacue.ordenes.excepcion;

/** 400 - dato invalido detectado en el servicio. */
public class SolicitudInvalidaException extends RuntimeException {

    public SolicitudInvalidaException(String mensaje) {
        super(mensaje);
    }
}
