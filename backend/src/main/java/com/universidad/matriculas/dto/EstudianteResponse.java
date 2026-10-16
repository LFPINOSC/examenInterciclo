package com.universidad.matriculas.dto;

/**
 * Información segura que se devuelve
 * al frontend.
 */
public class EstudianteResponse {

    private Long id;
    private String cedula;
    private String nombres;
    private String apellidos;
    private String telefono;

    private Long carreraId;
    private String carrera;

    private Long usuarioId;
    private String correo;

    public EstudianteResponse(
            Long id,
            String cedula,
            String nombres,
            String apellidos,
            String telefono,
            Long carreraId,
            String carrera,
            Long usuarioId,
            String correo
    ) {
        this.id = id;
        this.cedula = cedula;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.telefono = telefono;
        this.carreraId = carreraId;
        this.carrera = carrera;
        this.usuarioId = usuarioId;
        this.correo = correo;
    }

    public Long getId() {
        return id;
    }

    public String getCedula() {
        return cedula;
    }

    public String getNombres() {
        return nombres;
    }

    public String getApellidos() {
        return apellidos;
    }

    public String getTelefono() {
        return telefono;
    }

    public Long getCarreraId() {
        return carreraId;
    }

    public String getCarrera() {
        return carrera;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public String getCorreo() {
        return correo;
    }
}