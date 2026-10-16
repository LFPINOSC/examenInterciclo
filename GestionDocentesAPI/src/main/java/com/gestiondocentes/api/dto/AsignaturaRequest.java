package com.gestiondocentes.api.dto;

import jakarta.validation.constraints.*;

public record AsignaturaRequest(
    @NotBlank String codigo,
    @NotBlank String nombre,
    @NotNull @Min(1) @Max(20) Integer creditos,
    @NotNull @Min(1) @Max(40) Integer horasSemanales,
    boolean activa) {}
