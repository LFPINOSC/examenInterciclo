
package com.enfermeria.gestion.Entidades;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(
    name = "enfermeros",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_enfermero_cedula",
            columnNames = "cedula"
        ),
        @UniqueConstraint(
            name = "uk_enfermero_licencia",
            columnNames = "numero_licencia"
        ),
        @UniqueConstraint(
            name = "uk_enfermero_usuario",
            columnNames = "id_usuario"
        )
    }
)
public class Enfermero {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_enfermero")
    private Long id;

    @NotNull(message = "El usuario del enfermero es obligatorio")
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @NotBlank(message = "La cédula es obligatoria")
    @Pattern(
        regexp = "^[0-9]{10}$",
        message = "La cédula debe contener exactamente 10 dígitos"
    )
    @Column(nullable = false, length = 10)
    private String cedula;

    @NotBlank(message = "El número de licencia es obligatorio")
    @Size(max = 30, message = "La licencia no puede superar 30 caracteres")
    @Column(name = "numero_licencia", nullable = false, length = 30)
    private String numeroLicencia;

    @Pattern(
        regexp = "^$|^[0-9+() -]{7,15}$",
        message = "El teléfono tiene un formato inválido"
    )
    @Column(length = 15)
    private String telefono;

    @Size(max = 100)
    @Column(length = 100)
    private String especialidad;

    @Column(nullable = false)
    private Boolean activo = true;

    public Enfermero() {
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

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getCedula() {
        return cedula;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
    }

    public String getNumeroLicencia() {
        return numeroLicencia;
    }

    public void setNumeroLicencia(String numeroLicencia) {
        this.numeroLicencia = numeroLicencia;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getEspecialidad() {
        return especialidad;
    }

    public void setEspecialidad(String especialidad) {
        this.especialidad = especialidad;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}
