package com.gestiondocentes.api.dto;
import com.gestiondocentes.api.entity.EstadoPeriodo;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
public record PeriodoRequest(@NotBlank String nombre,@NotNull LocalDate fechaInicio,@NotNull LocalDate fechaFin,@NotNull EstadoPeriodo estado) {}
