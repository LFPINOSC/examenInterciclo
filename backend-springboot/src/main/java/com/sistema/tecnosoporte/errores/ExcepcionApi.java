package com.sistema.tecnosoporte.errores;
import org.springframework.http.HttpStatus;
public class ExcepcionApi extends RuntimeException {
 private final HttpStatus estado;
 public ExcepcionApi(HttpStatus estado,String mensaje) { super(mensaje); this.estado=estado; }
 public HttpStatus getEstado() { return estado; }
 public static ExcepcionApi noExiste(String que) { return new ExcepcionApi(HttpStatus.NOT_FOUND,que+" no encontrado"); }
 public static ExcepcionApi prohibido() { return new ExcepcionApi(HttpStatus.FORBIDDEN,"No tienes permisos para este recurso"); }
 public static ExcepcionApi conflicto(String msg) { return new ExcepcionApi(HttpStatus.CONFLICT,msg); }
 public static ExcepcionApi malo(String msg) { return new ExcepcionApi(HttpStatus.BAD_REQUEST,msg); }
}
