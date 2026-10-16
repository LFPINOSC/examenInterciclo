package com.andres.odontologia_api.modelo;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

// Entidad encargada de gestionar las citas odontologicas
@Entity
@Table(name = "citas")
public class Cita {

    // Identificador unico de la cita
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relacion con el paciente que reserva la cita
    @NotNull(message = "El paciente es obligatorio")
    @ManyToOne
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    // Relacion con el odontologo que atendera
    @NotNull(message = "El odontologo es obligatorio")
    @ManyToOne
    @JoinColumn(name = "odontologo_id", nullable = false)
    private Odontologo odontologo;

    // Relacion con el servicio odontologico
    @NotNull(message = "El servicio es obligatorio")
    @ManyToOne
    @JoinColumn(name = "servicio_id", nullable = false)
    private Servicio servicio;

    // Fecha y hora de la cita
    @NotNull(message = "La fecha y hora son obligatorias")
    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    // Estado de la cita
    @NotBlank(message = "El estado es obligatorio")
    @Pattern(
        regexp = "PENDIENTE|CONFIRMADA|ATENDIDA|CANCELADA",
        message = "Estado de cita no valido"
    )
    @Column(nullable = false, length = 20)
    private String estado = "PENDIENTE";

    // Observaciones adicionales
    @Column(length = 255)
    private String observaciones;

    // Constructor vacio requerido por JPA
    public Cita() {
    }

    // Obtener y modificar el ID
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // Obtener y modificar el paciente
    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

    // Obtener y modificar el odontologo
    public Odontologo getOdontologo() {
        return odontologo;
    }

    public void setOdontologo(Odontologo odontologo) {
        this.odontologo = odontologo;
    }

    // Obtener y modificar el servicio
    public Servicio getServicio() {
        return servicio;
    }

    public void setServicio(Servicio servicio) {
        this.servicio = servicio;
    }

    // Obtener y modificar la fecha y hora
    public LocalDateTime getFechaHora() {
        return fechaHora;
    }

    public void setFechaHora(LocalDateTime fechaHora) {
        this.fechaHora = fechaHora;
    }

    // Obtener y modificar el estado
    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    // Obtener y modificar las observaciones
    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
}