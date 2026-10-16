
package com.enfermeria.gestion.DTO;

import jakarta.validation.constraints.*;

public record RegistroActividadRequest(

    @NotBlank(message = "El resultado de la atención es obligatorio")
    @Size(max = 2000)
    String resultado,

    @Size(max = 2000)
    String observaciones

) {}
