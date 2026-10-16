
package com.enfermeria.gestion.Entidades;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "turnos")
public class Turno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_turno")
    private Long id;

    @NotNull(message = "Debe seleccionar un enfermero")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_enfermero", nullable = false)
    private Enfermero enfermero;

    @NotNull(message = "La fecha y hora de inicio son obligatorias")
    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio;

    @NotNull(message = "La fecha y hora de fin son obligatorias")
    @Column(name = "fecha_fin", nullable = false)
    private LocalDateTime fechaFin;

    @Size(max = 200)
    @Column(length = 200)
    private String observaciones;

    @Column(nullable = false)
    private Boolean activo = true;

    public Turno() {
    }

    @AssertTrue(message = "La fecha de fin debe ser posterior al inicio")
    @Transient
    public boolean isHorarioValido() {
        if (fechaInicio == null || fechaFin == null) {
            return true;
        }
        return fechaFin.isAfter(fechaInicio);
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

    public Enfermero getEnfermero() {
        return enfermero;
    }

    public void setEnfermero(Enfermero enfermero) {
        this.enfermero = enfermero;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDateTime getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDateTime fechaFin) {
        this.fechaFin = fechaFin;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}
