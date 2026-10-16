package com.examen.citasmedicas.excepciones;

// ==========================================
// IMPORTACIONES
// ==========================================

// Permiten devolver respuestas HTTP con
// codigos de estado y cuerpos personalizados.
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

// Permite manejar errores de la base de datos.
import org.springframework.dao.DataIntegrityViolationException;

// Errores de validacion y conversion de JSON.
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

// Permiten detectar y manejar excepciones REST.
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

// Herramientas para registrar errores internos.
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// Clases para generar respuestas estructuradas.
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * ==========================================
 * CONTROL GLOBAL DE ERRORES
 * SISTEMA DE CONTROL DE CITAS MEDICAS
 * ==========================================
 *
 * Centraliza el manejo de errores de la API.
 *
 * Permite devolver respuestas JSON uniformes
 * sin repetir codigo en cada controlador.
 *
 * Maneja:
 * 400 - Datos invalidos.
 * 404 - Recurso inexistente.
 * 409 - Conflictos de datos.
 * 500 - Errores internos inesperados.
 *
 * Los errores 401 y 403 de Spring Security
 * se configuraran en SeguridadConfig.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Registrador de errores internos.
    private static final Logger log =
            LoggerFactory.getLogger(
                    GlobalExceptionHandler.class
            );

    // ==========================================
    // ESTRUCTURA DE LA RESPUESTA
    // ==========================================

    /**
     * Define el formato JSON para los errores.
     *
     * No incluye contraseñas ni detalles
     * tecnicos internos del servidor.
     */
    public record ApiError(
            LocalDateTime fecha,
            int status,
            String mensaje,
            Map<String, String> errores
    ) {}

    /**
     * Construye una respuesta HTTP uniforme.
     */
    private ResponseEntity<ApiError> responder(
            HttpStatus estado,
            String mensaje,
            Map<String, String> errores) {

        ApiError respuesta = new ApiError(
                LocalDateTime.now(),
                estado.value(),
                mensaje,
                errores
        );

        return ResponseEntity.status(estado)
                .body(respuesta);
    }

    // ==========================================
    // ERROR 400 - VALIDACION DE CAMPOS
    // ==========================================

    /**
     * Captura errores producidos por @Valid.
     *
     * Ejemplos:
     * - Nombre vacio.
     * - Cedula con longitud incorrecta.
     * - Correo electronico invalido.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validarCampos(
            MethodArgumentNotValidException ex) {

        Map<String, String> errores =
                new LinkedHashMap<>();

        // Recorrer los campos con errores.
        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error -> errores.put(
                        error.getField(),
                        error.getDefaultMessage() == null
                                ? "Valor invalido"
                                : error.getDefaultMessage()
                ));

        return responder(
                HttpStatus.BAD_REQUEST,
                "Los datos enviados no son validos",
                errores
        );
    }

    // ==========================================
    // ERRORES HTTP DE LOS SERVICIOS
    // ==========================================

    /**
     * Captura los ResponseStatusException
     * que generan nuestros servicios.
     *
     * Ejemplos:
     * 400 - Fecha de cita incorrecta.
     * 404 - Paciente inexistente.
     * 409 - Medico ocupado.
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> manejarEstado(
            ResponseStatusException ex) {

        HttpStatus estado = HttpStatus.resolve(
                ex.getStatusCode().value()
        );

        if (estado == null) {
            estado = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        String mensaje = ex.getReason() != null
                ? ex.getReason()
                : "No se pudo completar la operacion";

        return responder(
                estado,
                mensaje,
                Map.of()
        );
    }

    // ==========================================
    // ERROR 400 - JSON INCORRECTO
    // ==========================================

    /**
     * Detecta un JSON mal escrito o datos
     * incompatibles con los tipos Java.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> jsonIncorrecto(
            HttpMessageNotReadableException ex) {

        return responder(
                HttpStatus.BAD_REQUEST,
                "El JSON enviado es incorrecto",
                Map.of()
        );
    }

    // ==========================================
    // ERROR 400 - PARAMETROS INVALIDOS
    // ==========================================

    /**
     * Detecta errores al convertir parametros.
     *
     * Ejemplo:
     * GET /api/pacientes/abc
     * cuando el ID debe ser numerico.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> parametroIncorrecto(
            MethodArgumentTypeMismatchException ex) {

        return responder(
                HttpStatus.BAD_REQUEST,
                "El parametro enviado no tiene el tipo correcto",
                Map.of(
                        ex.getName(),
                        "Valor invalido"
                )
        );
    }

    // ==========================================
    // ERROR 409 - RESTRICCIONES DE POSTGRESQL
    // ==========================================

    /**
     * Captura conflictos de integridad de datos.
     *
     * Ejemplos:
     * - Claves unicas duplicadas.
     * - Claves foraneas relacionadas.
     *
     * No expone detalles internos de PostgreSQL.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> errorBaseDatos(
            DataIntegrityViolationException ex) {

        return responder(
                HttpStatus.CONFLICT,
                "La operacion incumple una restriccion de la base de datos",
                Map.of()
        );
    }

    // ==========================================
    // ERROR 500 - ERRORES INESPERADOS
    // ==========================================

    /**
     * Captura los errores no previstos.
     *
     * Registra el detalle en el servidor,
     * pero devuelve al cliente un mensaje seguro.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> errorGeneral(
            Exception ex) {

        log.error(
                "Error inesperado en la API",
                ex
        );

        return responder(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Ocurrio un error interno en el servidor",
                Map.of()
        );
    }
}