package com.universidad.matriculas.model;

import jakarta.persistence.*;

/**
 * Entidad que representa a los usuarios que pueden
 * iniciar sesión en el sistema.
 */
@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nombre completo del usuario
    @Column(nullable = false)
    private String nombre;

    // El correo será utilizado para iniciar sesión
    @Column(nullable = false, unique = true)
    private String correo;

    // La contraseña se almacenará cifrada
    @Column(nullable = false)
    private String password;

    // Rol del usuario dentro del sistema
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rol rol;

    // Permite activar o desactivar usuarios
    @Column(nullable = false)
    private Boolean activo = true;

    public Usuario() {
    }

    public Usuario(
            Long id,
            String nombre,
            String correo,
            String password,
            Rol rol,
            Boolean activo
    ) {
        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.password = password;
        this.rol = rol;
        this.activo = activo;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}