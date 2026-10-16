package com.examen.citasmedicas.dto;

// ==========================================
// IMPORTACIONES
// ==========================================

// Validaciones para los datos recibidos.
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

// Tipos de datos para fechas y horas.
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * ==========================================
 * DTO DE CITAS MEDICAS
 * SISTEMA DE CONTROL DE CITAS MEDICAS
 * ==========================================
 *
 * DTO significa Data Transfer Object.
 *
 * Permite recibir informacion desde Angular
 * sin exponer directamente las relaciones
 * de las entidades de PostgreSQL.
 *
 * En lugar de recibir objetos completos,
 * recibimos los identificadores:
 *
 * pacienteId: ID del paciente.
 * medicoId: ID del medico.
 *
 * Los estados permitidos son:
 * PENDIENTE, CONFIRMADA, CANCELADA, ATENDIDA.
 *
 * El estado es opcional al registrar una cita,
 * porque CitaService asigna PENDIENTE.
 */
public record CitaDTO(

        // Fecha programada para la cita.
        @NotNull(message = "La fecha es obligatoria")
        LocalDate fecha,

        // Hora programada para la cita.
        @NotNull(message = "La hora es obligatoria")
        LocalTime hora,

        // Motivo de la consulta medica.
        @NotBlank(message = "El motivo es obligatorio")
        @Size(
            max = 255,
            message = "El motivo no puede superar 255 caracteres"
        )
        String motivo,

        // Estado de la cita.
        // Si no se envia, se conserva o se asigna
        // el estado correspondiente desde el backend.
        @Pattern(
            regexp = "PENDIENTE|CONFIRMADA|CANCELADA|ATENDIDA",
            message = "El estado no es valido"
        )
        String estado,

        // Clave foranea del paciente.
        @NotNull(message = "Debe seleccionar un paciente")
        Long pacienteId,

        // Clave foranea del medico.
        @NotNull(message = "Debe seleccionar un medico")
        Long medicoId

) {}