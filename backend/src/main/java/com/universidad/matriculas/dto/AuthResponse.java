package com.universidad.matriculas.dto;

/**
 * DTO enviado al frontend después de una
 * autenticación exitosa.
 */
public class AuthResponse {

    private String token;
    private Long id;
    private String nombre;
    private String correo;
    private String rol;

    public AuthResponse(
            String token,
            Long id,
            String nombre,
            String correo,
            String rol
    ) {
        this.token = token;
        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.rol = rol;
    }

    public String getToken() {
        return token;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getCorreo() {
        return correo;
    }

    public String getRol() {
        return rol;
    }
}