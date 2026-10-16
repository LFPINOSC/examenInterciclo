package com.gestiondocentes.api.exception;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestControllerAdvice public class GlobalExceptionHandler {
    private Map<String,Object> body(HttpStatus s,String m) {
        Map<String,Object>b=new LinkedHashMap<>();
        b.put("fecha",LocalDateTime.now());
        b.put("estado",s.value());
        b.put("error",s.getReasonPhrase());
        b.put("mensaje",m);
        return b;
    }
    @ExceptionHandler(RecursoNoEncontradoException.class) ResponseEntity<?> nf(RecursoNoEncontradoException e) {
        return ResponseEntity.status(404).body(body(HttpStatus.NOT_FOUND,e.getMessage()));
    }
    @ExceptionHandler(ConflictoException.class) ResponseEntity<?> cf(ConflictoException e) {
        return ResponseEntity.status(409).body(body(HttpStatus.CONFLICT,e.getMessage()));
    }
    @ExceptionHandler(AutenticacionException.class) ResponseEntity<?> au(AutenticacionException e) {
        return ResponseEntity.status(401).body(body(HttpStatus.UNAUTHORIZED,e.getMessage()));
    }
    @ExceptionHandler(CuentaNoDisponibleException.class) ResponseEntity<?> cd(CuentaNoDisponibleException e) {
        return ResponseEntity.status(403).body(body(HttpStatus.FORBIDDEN,e.getMessage()));
    }
    @ExceptionHandler(IllegalArgumentException.class) ResponseEntity<?> ia(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(body(HttpStatus.BAD_REQUEST,e.getMessage()));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<?> va(MethodArgumentNotValidException e) {
        Map<String,List<String>> errs=new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors().forEach(x->errs.computeIfAbsent(x.getField(),k->new ArrayList<>()).add(x.getDefaultMessage()));
        Map<String,Object>b=body(HttpStatus.BAD_REQUEST,"Revise los campos enviados");
        b.put("campos",errs);
        return ResponseEntity.badRequest().body(b);
    }
    @ExceptionHandler(ConstraintViolationException.class) ResponseEntity<?> cv(ConstraintViolationException e) {
        Map<String,String>errs=new LinkedHashMap<>();
        e.getConstraintViolations().forEach(v->errs.put(v.getPropertyPath().toString(),v.getMessage()));
        Map<String,Object>b=body(HttpStatus.BAD_REQUEST,"Uno o mas parametros no son validos");
        b.put("campos",errs);
        return ResponseEntity.badRequest().body(b);
    }
    @ExceptionHandler(HttpMessageNotReadableException.class) ResponseEntity<?> json(HttpMessageNotReadableException e) {
        Map<String,Object>b=body(HttpStatus.BAD_REQUEST,"El JSON contiene un dato invalido");
        Throwable c=e.getCause();
        while(c!=null && !(c instanceof InvalidFormatException) && c.getCause()!=null)c=c.getCause();
        if(c instanceof InvalidFormatException i) {
            String campo=i.getPath().isEmpty()?"campo":i.getPath().get(i.getPath().size()-1).getFieldName();
            b.put("campo",campo);
            b.put("valorRecibido",i.getValue());
            if(i.getTargetType()!=null&&i.getTargetType().isEnum()) {
                b.put("mensaje","El valor '"+i.getValue()+"' no es valido para '"+campo+"'");
                b.put("valoresPermitidos",Arrays.stream(i.getTargetType().getEnumConstants()).map(Object::toString).collect(Collectors.joining(", ")));
            }
        }
        return ResponseEntity.badRequest().body(b);
    }
    @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<?> db(DataIntegrityViolationException e) {
        return ResponseEntity.status(409).body(body(HttpStatus.CONFLICT,"La operacion viola una restriccion de integridad o un dato unico ya existe"));
    }
    @ExceptionHandler(Exception.class) ResponseEntity<?> gen(Exception e) {
        return ResponseEntity.status(500).body(body(HttpStatus.INTERNAL_SERVER_ERROR,"Ocurrio un error interno en el servidor"));
    }
}
