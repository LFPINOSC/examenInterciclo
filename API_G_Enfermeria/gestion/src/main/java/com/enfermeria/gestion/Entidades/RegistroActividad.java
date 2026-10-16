
package com.enfermeria.gestion.Entidades;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "registros_actividad")
public class RegistroActividad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_registro")
    private Long id;

    @NotNull(message = "Debe seleccionar una actividad")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_actividad", nullable = false)
    private Actividad actividad;

    @NotNull(message = "Debe indicar el enfermero que registra")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_enfermero", nullable = false)
    private Enfermero enfermero;

    @Column(name = "fecha_registro", nullable = false,
            updatable = false)
    private LocalDateTime fechaRegistro;

    @NotBlank(message = "El resultado es obligatorio")
    @Size(max = 2000)
    @Column(nullable = false, length = 2000)
    private String resultado;

    @Size(max = 2000)
    @Column(length = 2000)
    private String observaciones;

    public RegistroActividad() {
    }

    @PrePersist
    public void antesDeGuardar() {
        fechaRegistro = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Actividad getActividad() {
        return actividad;
    }

    public void setActividad(Actividad actividad) {
        this.actividad = actividad;
    }

    public Enfermero getEnfermero() {
        return enfermero;
    }

    public void setEnfermero(Enfermero enfermero) {
        this.enfermero = enfermero;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public String getResultado() {
        return resultado;
    }

    public void setResultado(String resultado) {
        this.resultado = resultado;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
}
