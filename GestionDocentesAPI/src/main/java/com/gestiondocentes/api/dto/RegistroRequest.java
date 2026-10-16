package com.gestiondocentes.api.dto;

import jakarta.validation.constraints.*;

public record RegistroRequest(
        @NotBlank @Size(min=2,max=100) @Pattern(regexp="^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ .'-]+$",message="El nombre solo puede contener letras") String nombre,
        @NotBlank @Pattern(regexp="^\\d{10}$",message="La cedula debe contener exactamente 10 digitos") String cedula,
        @NotBlank @Pattern(regexp="^09\\d{8}$",message="El telefono debe tener 10 digitos y comenzar con 09") String telefono,
        @NotBlank @Email String correo,
        @NotBlank @Size(min=8,max=100) @Pattern(regexp="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$",message="La contrasena debe incluir mayuscula, minuscula, numero y caracter especial") String password
) {
}
