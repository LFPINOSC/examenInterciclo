package com.andres.odontologia_api.modelo;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

// Entidad que almacena los datos personales de los pacientes
@Entity
@Table(name = "pacientes")
public class Paciente {

    // Identificador principal del paciente
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Cedula unica de 10 digitos
    @NotBlank(message = "La cedula es obligatoria")
    @Pattern(regexp = "\\d{10}", message = "La cedula debe tener 10 digitos")
    @Column(nullable = false, unique = true, length = 10)
    private String cedula;

    // Nombre del paciente
    @NotBlank(message = "El nombre es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;

    // Apellido del paciente
    @NotBlank(message = "El apellido es obligatorio")
    @Column(nullable = false, length = 100)
    private String apellido;

    // Numero de telefono
    @Column(length = 20)
    private String telefono;

    // Correo electronico del paciente
    @Email(message = "El correo no es valido")
    @Column(length = 100)
    private String correo;

    // Direccion del domicilio
    @Column(length = 200)
    private String direccion;

    // Relacion opcional uno a uno con Usuario
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", unique = true)
    private Usuario usuario;

    // Constructor vacio requerido por JPA
    public Paciente() {
    }

    // Metodos Getters y Setters
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

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}