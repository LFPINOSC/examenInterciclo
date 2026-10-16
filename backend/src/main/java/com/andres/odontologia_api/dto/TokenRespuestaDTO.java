package com.andres.odontologia_api.dto;

// Devuelve los datos de autenticacion al frontend.
// Nunca devuelve la contraseña del usuario.
public record TokenRespuestaDTO(

    // Token utilizado para acceder a la API.
    String token,

    // Tipo de autenticacion.
    String tipo,

    // Nombre de usuario autenticado.
    String username,

    // Rol del usuario.
    String rol

) {}