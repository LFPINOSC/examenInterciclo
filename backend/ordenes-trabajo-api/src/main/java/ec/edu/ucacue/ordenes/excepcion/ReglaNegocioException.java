package ec.edu.ucacue.ordenes.excepcion;

/** 409 - la peticion rompe una regla del negocio. */
public class ReglaNegocioException extends RuntimeException {

    public ReglaNegocioException(String mensaje) {
        super(mensaje);
    }
}
