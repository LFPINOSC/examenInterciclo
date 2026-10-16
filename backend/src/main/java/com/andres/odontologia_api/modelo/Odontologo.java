package com.andres.odontologia_api.modelo;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

// Entidad que representa a los profesionales odontologos
@Entity
@Table(name = "odontologos")
public class Odontologo {

    // Identificador unico
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nombre del odontologo
    @NotBlank(message = "El nombre es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;

    // Apellido del odontologo
    @NotBlank(message = "El apellido es obligatorio")
    @Column(nullable = false, length = 100)
    private String apellido;

    // Especialidad: ortodoncia, endodoncia, etc.
    @Column(length = 100)
    private String especialidad;

    // Numero telefonico
    @Column(length = 20)
    private String telefono;

    // Correo electronico
    @Email(message = "El correo no es valido")
    @Column(length = 100)
    private String correo;

    // Constructor vacio requerido por JPA
    public Odontologo() {
    }

    // Metodos Getters y Setters
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

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getEspecialidad() {
        return especialidad;
    }

    public void setEspecialidad(String especialidad) {
        this.especialidad = especialidad;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }
}