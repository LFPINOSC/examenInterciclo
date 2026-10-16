package ec.edu.ucacue.ordenes.excepcion;

/** 409 - valor unico repetido (cedula, correo, serie, usuario). */
public class RecursoDuplicadoException extends RuntimeException {

    public RecursoDuplicadoException(String mensaje) {
        super(mensaje);
    }
}
