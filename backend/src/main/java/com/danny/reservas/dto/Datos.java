package com.danny.reservas.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public class Datos {
  public record Registro(
      @NotBlank @Size(max = 100) String nombre,
      @NotBlank @Email @Size(max = 160) String email,
      @NotBlank
          @Size(min = 10, max = 72)
          @Pattern(
              regexp = "(?s)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*",
              message = "Incluye mayúscula, minúscula y número")
          String password) {}

  public record Login(@NotBlank @Email String email, @NotBlank String password) {}

  public record Hotel(
      @NotBlank @Size(max = 100) String nombre,
      @NotBlank @Size(max = 80) String ciudad,
      @NotBlank @Size(max = 200) String direccion,
      @NotNull @Size(max = 500) String descripcion) {}

  public record Tipo(
      @NotBlank @Size(max = 60) String nombre, @NotNull @Size(max = 300) String descripcion) {}

  public record Habitacion(
      @NotNull @Positive Long hotelId,
      @NotNull @Positive Long tipoId,
      @NotBlank @Size(max = 15) String numero,
      @NotNull @DecimalMin("0.01") @DecimalMax("99999999.99") @Digits(integer = 8, fraction = 2)
          BigDecimal precioNoche,
      @Min(1) @Max(20) int capacidad,
      boolean activa) {}

  public record Reserva(
      @NotNull @Positive Long habitacionId,
      @NotNull LocalDate entrada,
      @NotNull LocalDate salida,
      @Min(1) @Max(20) int huespedes) {}

  public record Activo(boolean activo) {}
}
