package com.andres.odontologia_api.modelo;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

// Entidad encargada de gestionar los usuarios del sistema
@Entity
@Table(name = "usuarios")
public class Usuario {

    // Identificador del usuario
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nombre de usuario único
    @NotBlank(message = "El usuario es obligatorio")
    @Column(nullable = false, unique = true, length = 50)
    private String username;

    // Contraseña del usuario (se almacenará cifrada)
    @NotBlank(message = "La contraseña es obligatoria")
    @Column(nullable = false, length = 255)
    private String password;

    // Rol del usuario: ADMIN o USER
    @NotBlank(message = "El rol es obligatorio")
    @Pattern(regexp = "ADMIN|USER")
    @Column(nullable = false, length = 20)
    private String rol = "USER";

    // Indica si el usuario está activo
    @Column(nullable = false)
    private boolean activo = true;

    // Constructor vacío requerido por JPA
    public Usuario() {
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }
}