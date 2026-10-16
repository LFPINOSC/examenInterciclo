package com.jordy.ambulancias.controladores;
import org.springframework.web.bind.annotation.*;import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;import java.util.*;
@RestControllerAdvice public class ErroresController {
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<?> validar(MethodArgumentNotValidException ex){Map<String,String> m=new LinkedHashMap<>();ex.getBindingResult().getFieldErrors().forEach(e->m.put(e.getField(),e.getDefaultMessage()));return ResponseEntity.badRequest().body(Map.of("mensajes",m));}
 @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<?> unico(DataIntegrityViolationException ex){return ResponseEntity.status(409).body(Map.of("mensaje","Dato duplicado o registro relacionado con otros datos"));}
}
