package com.universidad.matriculas.model;

import jakarta.persistence.*;

/**
 * Entidad que almacena los datos académicos
 * y personales de un estudiante.
 */
@Entity
@Table(name = "estudiantes")
public class Estudiante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Número de identificación único
    @Column(nullable = false, unique = true, length = 10)
    private String cedula;

    @Column(nullable = false, length = 80)
    private String nombres;

    @Column(nullable = false, length = 80)
    private String apellidos;

    @Column(length = 20)
    private String telefono;

    /**
     * Cada estudiante pertenece a una carrera.
     *
     * Muchos estudiantes pueden pertenecer
     * a una misma carrera.
     */
    @ManyToOne
    @JoinColumn(
            name = "carrera_id",
            nullable = false
    )
    private Carrera carrera;

    /**
     * Cada estudiante está relacionado
     * con una única cuenta de usuario.
     */
    @OneToOne
    @JoinColumn(
            name = "usuario_id",
            nullable = false,
            unique = true
    )
    private Usuario usuario;

    public Estudiante() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCedula() {
        return cedula;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
    }

    public String getNombres() {
        return nombres;
    }

    public void setNombres(String nombres) {
        this.nombres = nombres;
    }

    public String getApellidos() {
        return apellidos;
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public Carrera getCarrera() {
        return carrera;
    }

    public void setCarrera(Carrera carrera) {
        this.carrera = carrera;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}