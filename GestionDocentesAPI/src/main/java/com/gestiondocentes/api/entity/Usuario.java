package com.gestiondocentes.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "usuarios",
    uniqueConstraints = {
      @UniqueConstraint(columnNames = "correo"),
      @UniqueConstraint(columnNames = "cedula")
    })
public class Usuario {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank
  @Size(min = 2, max = 100)
  @Column(nullable = false, length = 100)
  private String nombre;

  @Pattern(regexp = "^\\d{10}$", message = "La cedula debe contener exactamente 10 digitos")
  @Column(unique = true, length = 10)
  private String cedula;

  @Pattern(regexp = "^09\\d{8}$", message = "El telefono debe tener 10 digitos y comenzar con 09")
  @Column(length = 10)
  private String telefono;

  @NotBlank
  @Email
  @Column(nullable = false, unique = true, length = 150)
  private String correo;

  @JsonIgnore
  @NotBlank
  @Column(nullable = false)
  private String password;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Rol rol = Rol.USER;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private EstadoUsuario estado = EstadoUsuario.PENDIENTE;

  @Column(nullable = false)
  private boolean verificado = false;

  @JsonIgnore
  @Column(length = 6)
  private String codigoVerificacion;

  @JsonIgnore private LocalDateTime codigoExpiraEn;

  @Column(nullable = false)
  private LocalDateTime fechaRegistro = LocalDateTime.now();

  public Long getId() {
    return id;
  }

  public void setId(Long v) {
    id = v;
  }

  public String getNombre() {
    return nombre;
  }

  public void setNombre(String v) {
    nombre = v;
  }

  public String getCedula() {
    return cedula;
  }

  public void setCedula(String v) {
    cedula = v;
  }

  public String getTelefono() {
    return telefono;
  }

  public void setTelefono(String v) {
    telefono = v;
  }

  public String getCorreo() {
    return correo;
  }

  public void setCorreo(String v) {
    correo = v;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String v) {
    password = v;
  }

  public Rol getRol() {
    return rol;
  }

  public void setRol(Rol v) {
    rol = v;
  }

  public EstadoUsuario getEstado() {
    return estado;
  }

  public void setEstado(EstadoUsuario v) {
    estado = v;
  }

  public boolean isVerificado() {
    return verificado;
  }

  public void setVerificado(boolean v) {
    verificado = v;
  }

  public String getCodigoVerificacion() {
    return codigoVerificacion;
  }

  public void setCodigoVerificacion(String v) {
    codigoVerificacion = v;
  }

  public LocalDateTime getCodigoExpiraEn() {
    return codigoExpiraEn;
  }

  public void setCodigoExpiraEn(LocalDateTime v) {
    codigoExpiraEn = v;
  }

  public LocalDateTime getFechaRegistro() {
    return fechaRegistro;
  }

  public void setFechaRegistro(LocalDateTime v) {
    fechaRegistro = v;
  }
}
