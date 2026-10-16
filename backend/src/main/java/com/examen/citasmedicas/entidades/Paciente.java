package com.examen.citasmedicas.entidades;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

// Entidad que representa a los pacientes registrados
@Entity
@Table(name = "pacientes")
public class Paciente {

    // Clave primaria autoincremental
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nombre del paciente
    @NotBlank(message = "El nombre es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;

    // Apellido del paciente
    @NotBlank(message = "El apellido es obligatorio")
    @Column(nullable = false, length = 100)
    private String apellido;

    // Cedula unica de 10 digitos
    @NotBlank(message = "La cedula es obligatoria")
    @Pattern(regexp = "^[0-9]{10}$",
             message = "La cedula debe tener 10 digitos")
    @Column(nullable = false, unique = true, length = 10)
    private String cedula;

    // Telefono de contacto
    @Column(length = 15)
    private String telefono;

    // Correo electronico
    @Email(message = "Ingrese un correo valido")
    @Column(length = 150)
    private String correo;

    // Constructor vacio requerido por JPA
    public Paciente() {
    }

    // Metodos GET y SET
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

    public String getCedula() {
        return cedula;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
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