package com.examen.citasmedicas.entidades;

// ==========================================
// IMPORTACIONES
// ==========================================

// Anotaciones de JPA para crear tablas y relaciones
import jakarta.persistence.*;

// Validaciones de los datos ingresados
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

// Clases de Java para manejar fechas y horas
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * ENTIDAD CITA
 *
 * Representa una cita medica registrada en el sistema.
 *
 * Cada cita pertenece a:
 * - Un paciente.
 * - Un medico.
 *
 * Un paciente puede tener varias citas.
 * Un medico puede atender varias citas.
 *
 * Hibernate utiliza esta clase para crear
 * y administrar la tabla "citas" en PostgreSQL.
 */
@Entity
@Table(name = "citas")
public class Cita {

    // ==========================================
    // IDENTIFICADOR DE LA CITA
    // ==========================================

    /**
     * Clave primaria de la tabla citas.
     *
     * @Id identifica la clave primaria.
     * @GeneratedValue genera el ID automaticamente.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==========================================
    // FECHA Y HORA
    // ==========================================

    /**
     * Fecha programada para la cita medica.
     *
     * LocalDate almacena solamente la fecha.
     * Ejemplo: 2026-10-20
     */
    @NotNull(message = "La fecha es obligatoria")
    @Column(nullable = false)
    private LocalDate fecha;

    /**
     * Hora programada para la atencion.
     *
     * LocalTime almacena solamente la hora.
     * Ejemplo: 09:30
     */
    @NotNull(message = "La hora es obligatoria")
    @Column(nullable = false)
    private LocalTime hora;

    // ==========================================
    // INFORMACION DE LA CITA
    // ==========================================

    /**
     * Motivo por el cual el paciente solicita
     * una consulta medica.
     */
    @NotBlank(message = "El motivo es obligatorio")
    @Column(nullable = false, length = 255)
    private String motivo;

    /**
     * Estado actual de la cita.
     *
     * Estados permitidos:
     * PENDIENTE  - Cita registrada.
     * CONFIRMADA - Cita confirmada.
     * CANCELADA  - Cita cancelada.
     * ATENDIDA   - Consulta realizada.
     *
     * @Pattern restringe los valores permitidos.
     */
    @NotBlank(message = "El estado es obligatorio")
    @Pattern(
        regexp = "^(PENDIENTE|CONFIRMADA|CANCELADA|ATENDIDA)$",
        message = "Estado de cita no valido"
    )
    @Column(nullable = false, length = 20)
    private String estado = "PENDIENTE";

    // ==========================================
    // RELACION CON PACIENTE
    // ==========================================

    /**
     * Relacion MUCHOS A UNO (ManyToOne).
     *
     * Muchas citas pueden pertenecer
     * a un mismo paciente.
     *
     * @JoinColumn crea la clave foranea
     * llamada paciente_id en PostgreSQL.
     *
     * nullable = false obliga a que toda cita
     * tenga un paciente asignado.
     */
    @NotNull(message = "El paciente es obligatorio")
    @ManyToOne
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    // ==========================================
    // RELACION CON MEDICO
    // ==========================================

    /**
     * Relacion MUCHOS A UNO (ManyToOne).
     *
     * Muchas citas pueden estar asignadas
     * a un mismo medico.
     *
     * medico_id sera una clave foranea
     * que apunta a la tabla medicos.
     */
    @NotNull(message = "El medico es obligatorio")
    @ManyToOne
    @JoinColumn(name = "medico_id", nullable = false)
    private Medico medico;

    // ==========================================
    // CONSTRUCTOR VACIO
    // ==========================================

    /**
     * Constructor requerido por JPA.
     *
     * Hibernate lo utiliza para crear objetos
     * cuando consulta los datos de PostgreSQL.
     */
    public Cita() {
    }

    // ==========================================
    // GETTERS Y SETTERS
    // ==========================================
    // GET: permite consultar los atributos.
    // SET: permite modificar los atributos.

    // Identificador
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // Fecha
    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    // Hora
    public LocalTime getHora() {
        return hora;
    }

    public void setHora(LocalTime hora) {
        this.hora = hora;
    }

    // Motivo
    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    // Estado
    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    // Paciente relacionado con la cita
    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

    // Medico relacionado con la cita
    public Medico getMedico() {
        return medico;
    }

    public void setMedico(Medico medico) {
        this.medico = medico;
    }
}