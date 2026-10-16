package com.examen.citasmedicas.entidades;

// Importaciones de JPA para relacionar la clase con PostgreSQL
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;

// Importacion para validar campos obligatorios
import jakarta.validation.constraints.NotBlank;

/**
 * ENTIDAD MEDICO
 *
 * Representa a los medicos registrados en el sistema.
 *
 * Cada medico tendra sus datos personales y especialidad.
 * Posteriormente, los medicos se relacionaran con las citas.
 *
 * Esta clase sera administrada por Hibernate mediante JPA.
 */
@Entity
@Table(name = "medicos")
public class Medico {

    /**
     * Identificador unico del medico.
     *
     * @Id indica que es la clave primaria.
     * @GeneratedValue permite generar el ID automaticamente.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Nombre del medico.
     *
     * @NotBlank impide recibir valores vacios.
     * @Column configura la columna de PostgreSQL.
     */
    @NotBlank(message = "El nombre es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;

    /**
     * Apellido del medico.
     */
    @NotBlank(message = "El apellido es obligatorio")
    @Column(nullable = false, length = 100)
    private String apellido;

    /**
     * Especialidad medica.
     *
     * Ejemplos: Pediatria, Cardiologia, Medicina General.
     */
    @NotBlank(message = "La especialidad es obligatoria")
    @Column(nullable = false, length = 100)
    private String especialidad;

    /**
     * Numero telefonico del medico.
     * Es un campo opcional.
     */
    @Column(length = 15)
    private String telefono;

    /**
     * Constructor vacio obligatorio para JPA.
     *
     * Hibernate lo utiliza para crear objetos
     * cuando recupera registros de PostgreSQL.
     */
    public Medico() {
    }

    // ==========================================
    // METODOS GETTERS Y SETTERS
    // ==========================================
    // GET: permite consultar el valor de un atributo.
    // SET: permite modificar el valor de un atributo.

    // Obtener el identificador del medico
    public Long getId() {
        return id;
    }

    // Establecer el identificador del medico
    public void setId(Long id) {
        this.id = id;
    }

    // Obtener el nombre
    public String getNombre() {
        return nombre;
    }

    // Modificar el nombre
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    // Obtener el apellido
    public String getApellido() {
        return apellido;
    }

    // Modificar el apellido
    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    // Obtener la especialidad
    public String getEspecialidad() {
        return especialidad;
    }

    // Modificar la especialidad
    public void setEspecialidad(String especialidad) {
        this.especialidad = especialidad;
    }

    // Obtener el telefono
    public String getTelefono() {
        return telefono;
    }

    // Modificar el telefono
    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }
}