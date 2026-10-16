package ec.edu.ucacue.ordenes.excepcion;

/** 403 - la cuenta no puede acceder o el recurso no le pertenece. */
public class AccesoDenegadoException extends RuntimeException {

    public AccesoDenegadoException(String mensaje) {
        super(mensaje);
    }
}
