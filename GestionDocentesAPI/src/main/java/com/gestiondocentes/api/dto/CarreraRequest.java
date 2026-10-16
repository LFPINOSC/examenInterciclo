package com.gestiondocentes.api.dto;
import jakarta.validation.constraints.*;
public record CarreraRequest(@NotBlank String codigo,@NotBlank String nombre,@Size(max=300) String descripcion,boolean activa) {}
