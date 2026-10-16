package com.universidad.matriculas.dto;

/**
 * DTO utilizado para registrar nuevos usuarios.
 *
 * El rol no se recibe desde el frontend por seguridad.
 * Todo registro publico se crea como ESTUDIANTE.
 */
public class RegistroRequest {

    private String nombre;
    private String correo;
    private String password;

    public RegistroRequest() {
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}