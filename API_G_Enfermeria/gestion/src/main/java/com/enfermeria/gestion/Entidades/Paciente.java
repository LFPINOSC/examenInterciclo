
package com.enfermeria.gestion.Entidades;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Entity
@Table(
    name = "pacientes",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_paciente_cedula",
            columnNames = "cedula"
        )
    }
)
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_paciente")
    private Long id;

    @NotBlank(message = "La cédula del paciente es obligatoria")
    @Pattern(
        regexp = "^[0-9]{10}$",
        message = "La cédula debe tener exactamente 10 dígitos"
    )
    @Column(nullable = false, length = 10)
    private String cedula;

    @NotBlank(message = "Los nombres del paciente son obligatorios")
    @Size(min = 2, max = 100)
    @Column(nullable = false, length = 100)
    private String nombres;

    @NotBlank(message = "Los apellidos del paciente son obligatorios")
    @Size(min = 2, max = 100)
    @Column(nullable = false, length = 100)
    private String apellidos;

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    @Past(message = "La fecha de nacimiento debe ser anterior a hoy")
    @Column(name = "fecha_nacimiento", nullable = false)
    private LocalDate fechaNacimiento;

    @Pattern(
        regexp = "^$|^[0-9+() -]{7,15}$",
        message = "El teléfono del paciente tiene un formato inválido"
    )
    @Column(length = 15)
    private String telefono;

    @Size(max = 200)
    @Column(length = 200)
    private String direccion;

    @Column(nullable = false)
    private Boolean activo = true;

    public Paciente() {
    }

    @PrePersist
    public void antesDeGuardar() {
        if (activo == null) activo = true;
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

    public LocalDate getFechaNacimiento() {
        return fechaNacimiento;
    }

    public void setFechaNacimiento(LocalDate fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}
