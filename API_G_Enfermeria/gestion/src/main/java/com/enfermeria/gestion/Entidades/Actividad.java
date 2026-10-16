
package com.enfermeria.gestion.Entidades;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "actividades")
public class Actividad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_actividad")
    private Long id;

    @NotNull(message = "Debe seleccionar un paciente")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_paciente", nullable = false)
    private Paciente paciente;

    @NotNull(message = "Debe asignar un enfermero")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_enfermero", nullable = false)
    private Enfermero enfermero;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_turno")
    private Turno turno;

    @NotNull(message = "El tipo de actividad es obligatorio")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TipoActividad tipo;

    @NotBlank(message = "La descripción de la actividad es obligatoria")
    @Size(min = 5, max = 1000)
    @Column(nullable = false, length = 1000)
    private String descripcion;

    @NotNull(message = "La fecha programada es obligatoria")
    @Column(name = "fecha_programada", nullable = false)
    private LocalDateTime fechaProgramada;

    @NotNull(message = "El estado de la actividad es obligatorio")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoActividad estado = EstadoActividad.PENDIENTE;

    @Column(name = "fecha_creacion", nullable = false,
            updatable = false)
    private LocalDateTime fechaCreacion;

    public Actividad() {
    }

    @PrePersist
    public void antesDeGuardar() {
        fechaCreacion = LocalDateTime.now();
        if (estado == null) {
            estado = EstadoActividad.PENDIENTE;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

    public Enfermero getEnfermero() {
        return enfermero;
    }

    public void setEnfermero(Enfermero enfermero) {
        this.enfermero = enfermero;
    }

    public Turno getTurno() {
        return turno;
    }

    public void setTurno(Turno turno) {
        this.turno = turno;
    }

    public TipoActividad getTipo() {
        return tipo;
    }

    public void setTipo(TipoActividad tipo) {
        this.tipo = tipo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDateTime getFechaProgramada() {
        return fechaProgramada;
    }

    public void setFechaProgramada(LocalDateTime fechaProgramada) {
        this.fechaProgramada = fechaProgramada;
    }

    public EstadoActividad getEstado() {
        return estado;
    }

    public void setEstado(EstadoActividad estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
}
