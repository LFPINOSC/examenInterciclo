package com.andres.odontologia_api.modelo;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

// Entidad encargada de registrar los pagos odontologicos
@Entity
@Table(name = "pagos")
public class Pago {

    // Identificador unico del pago
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relacion del pago con una cita odontologica
    // Cada cita puede tener como maximo un registro de pago
    @NotNull(message = "La cita es obligatoria")
    @OneToOne
    @JoinColumn(name = "cita_id", nullable = false, unique = true)
    private Cita cita;

    // Valor monetario del pago
    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(
        value = "0.0",
        message = "El monto no puede ser negativo"
    )
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    // Metodo utilizado para pagar
    @Column(name = "metodo_pago", length = 30)
    private String metodoPago;

    // Fecha en la que se realizo el pago
    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;

    // Estado del pago
    @NotBlank(message = "El estado es obligatorio")
    @Pattern(
        regexp = "PENDIENTE|PAGADO|CANCELADO",
        message = "Estado de pago no valido"
    )
    @Column(nullable = false, length = 20)
    private String estado = "PENDIENTE";

    // Constructor vacio requerido por JPA
    public Pago() {
    }

    // Obtener y modificar el ID
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // Obtener y modificar la cita
    public Cita getCita() {
        return cita;
    }

    public void setCita(Cita cita) {
        this.cita = cita;
    }

    // Obtener y modificar el monto
    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    // Obtener y modificar el metodo de pago
    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    // Obtener y modificar la fecha de pago
    public LocalDateTime getFechaPago() {
        return fechaPago;
    }

    public void setFechaPago(LocalDateTime fechaPago) {
        this.fechaPago = fechaPago;
    }

    // Obtener y modificar el estado
    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}