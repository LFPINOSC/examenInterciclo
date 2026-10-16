package ec.edu.ucacue.ordenes.excepcion;

/** 401 - usuario o contrasena incorrectos. */
public class CredencialesInvalidasException extends RuntimeException {

    public CredencialesInvalidasException(String mensaje) {
        super(mensaje);
    }
}
