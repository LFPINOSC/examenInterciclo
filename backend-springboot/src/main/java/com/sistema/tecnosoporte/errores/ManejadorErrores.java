package com.sistema.tecnosoporte.errores;
import java.time.OffsetDateTime;
import java.util.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import jakarta.validation.ConstraintViolationException;
@RestControllerAdvice
public class ManejadorErrores {
 private Map<String,Object> mensaje(HttpStatus estado,String msg,Map<String,String> errores) {
  Map<String,Object> r=new LinkedHashMap<>();
  r.put("fecha",OffsetDateTime.now());r.put("codigo",estado.value());r.put("error",estado.getReasonPhrase());r.put("mensaje",msg);
  if(errores!=null && !errores.isEmpty()) r.put("campos",errores);
  return r;
 }
 @ExceptionHandler(ExcepcionApi.class) ResponseEntity<?> negocio(ExcepcionApi ex) {return ResponseEntity.status(ex.getEstado()).body(mensaje(ex.getEstado(),ex.getMessage(),null));}
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<?> validacion(MethodArgumentNotValidException ex) {
  Map<String,String> campos=new LinkedHashMap<>(); ex.getBindingResult().getFieldErrors().forEach(e->campos.putIfAbsent(e.getField(),e.getDefaultMessage()));
  return ResponseEntity.badRequest().body(mensaje(HttpStatus.BAD_REQUEST,"Revisa los campos enviados",campos));
 }
 @ExceptionHandler(ConstraintViolationException.class) ResponseEntity<?> constraint(ConstraintViolationException ex) {
  return ResponseEntity.badRequest().body(mensaje(HttpStatus.BAD_REQUEST,"Datos invalidos",null));
 }
 @ExceptionHandler(HttpMessageNotReadableException.class) ResponseEntity<?> json(HttpMessageNotReadableException ex) {
  return ResponseEntity.badRequest().body(mensaje(HttpStatus.BAD_REQUEST,"JSON incorrecto, faltan datos o hay valores de enumeracion invalidos",null));
 }
 @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<?> integridad(DataIntegrityViolationException ex) {
  return ResponseEntity.status(HttpStatus.CONFLICT).body(mensaje(HttpStatus.CONFLICT,"Conflicto de datos: valor repetido o registro relacionado",null));
 }
 @ExceptionHandler(AccessDeniedException.class) ResponseEntity<?> acceso(AccessDeniedException ex) {
  return ResponseEntity.status(HttpStatus.FORBIDDEN).body(mensaje(HttpStatus.FORBIDDEN,"No tienes permisos para realizar esta operacion",null));
 }
 @ExceptionHandler(Exception.class) ResponseEntity<?> inesperado(Exception ex) {
  return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mensaje(HttpStatus.INTERNAL_SERVER_ERROR,"Error interno; consulta el registro del servidor",null));
 }
}
