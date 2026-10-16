
package com.enfermeria.gestion.Excepciones;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private Map<String, Object> respuesta(
            HttpStatus estado,
            String error,
            String mensaje,
            HttpServletRequest request) {

        Map<String, Object> datos = new LinkedHashMap<>();

        datos.put("timestamp", LocalDateTime.now());
        datos.put("status", estado.value());
        datos.put("error", error);
        datos.put("message", mensaje);
        datos.put("path", request.getRequestURI());

        return datos;
    }

    // 400 - Errores de validación
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> validacion(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        Map<String, Object> datos = respuesta(
                HttpStatus.BAD_REQUEST,
                "Error de validación",
                "Los datos enviados contienen errores.",
                request
        );

        Map<String, String> campos = new LinkedHashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error ->
                campos.put(
                        error.getField(),
                        error.getDefaultMessage()
                )
        );

        ex.getBindingResult().getGlobalErrors().forEach(error ->
                campos.put(
                        error.getObjectName(),
                        error.getDefaultMessage()
                )
        );

        datos.put("fieldErrors", campos);

        return ResponseEntity.badRequest().body(datos);
    }

    // 400 - JSON incorrecto
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> jsonInvalido(
            HttpMessageNotReadableException ex,
            HttpServletRequest request) {

        return ResponseEntity.badRequest().body(
                respuesta(
                        HttpStatus.BAD_REQUEST,
                        "JSON inválido",
                        "El JSON está vacío, mal formado o contiene valores incompatibles.",
                        request
                )
        );
    }

    // 400 - Reglas del negocio
    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<?> reglaNegocio(
            ReglaNegocioException ex,
            HttpServletRequest request) {

        return ResponseEntity.badRequest().body(
                respuesta(
                        HttpStatus.BAD_REQUEST,
                        "Regla de negocio incumplida",
                        ex.getMessage(),
                        request
                )
        );
    }

    // 401 - Credenciales incorrectas
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> credencialesInvalidas(
            BadCredentialsException ex,
            HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                respuesta(
                        HttpStatus.UNAUTHORIZED,
                        "Credenciales incorrectas",
                        "El correo o la contraseña son incorrectos.",
                        request
                )
        );
    }

    // 401 - No autenticado
    @ExceptionHandler(AuthenticationCredentialsNotFoundException.class)
    public ResponseEntity<?> noAutenticado(
            AuthenticationCredentialsNotFoundException ex,
            HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                respuesta(
                        HttpStatus.UNAUTHORIZED,
                        "Autenticación requerida",
                        "Debes iniciar sesión para realizar esta operación.",
                        request
                )
        );
    }

    // 403 - Cuenta desactivada
    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<?> cuentaDesactivada(
            DisabledException ex,
            HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                respuesta(
                        HttpStatus.FORBIDDEN,
                        "Cuenta desactivada",
                        "La cuenta está desactivada. Contacta al administrador.",
                        request
                )
        );
    }

    // 403 - Permisos insuficientes
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> accesoDenegado(
            AccessDeniedException ex,
            HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                respuesta(
                        HttpStatus.FORBIDDEN,
                        "Acceso denegado",
                        "No tienes permisos para realizar esta operación.",
                        request
                )
        );
    }

    // 404 - Recurso inexistente
    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<?> noEncontrado(
            RecursoNoEncontradoException ex,
            HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                respuesta(
                        HttpStatus.NOT_FOUND,
                        "Recurso no encontrado",
                        ex.getMessage(),
                        request
                )
        );
    }

    // 409 - Conflictos de datos
    @ExceptionHandler(ConflictoException.class)
    public ResponseEntity<?> conflicto(
            ConflictoException ex,
            HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                respuesta(
                        HttpStatus.CONFLICT,
                        "Conflicto de datos",
                        ex.getMessage(),
                        request
                )
        );
    }

    // 409 - Restricciones de PostgreSQL
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> integridad(
            DataIntegrityViolationException ex,
            HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                respuesta(
                        HttpStatus.CONFLICT,
                        "Restricción de base de datos",
                        "No se pudo guardar la información porque existe un dato duplicado o una relación que impide la operación.",
                        request
                )
        );
    }

    // 500 - Errores inesperados
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> errorInterno(
            Exception ex,
            HttpServletRequest request) {

        return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
        ).body(
                respuesta(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Error interno del servidor",
                        "Ocurrió un error inesperado al procesar la solicitud.",
                        request
                )
        );
    }
}
