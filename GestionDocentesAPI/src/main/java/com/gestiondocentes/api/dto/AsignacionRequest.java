package com.gestiondocentes.api.dto;

import jakarta.validation.constraints.*;

public record AsignacionRequest(
    @NotNull @Positive Long docenteId,
    @NotNull @Positive Long asignaturaId,
    @NotNull @Positive Long carreraId,
    @NotNull @Positive Long periodoId,
    @NotBlank @Size(max = 10) String paralelo,
    @NotNull @Min(1) @Max(40) Integer horasAsignadas) {}
