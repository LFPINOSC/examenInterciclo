package com.sistema.tecnosoporte.entidades;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.math.BigDecimal;
import com.sistema.tecnosoporte.enums.Rol;

@Entity
@Table(name="usuarios")
public class Usuario {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  @Column(nullable=false,length=80)
  private String nombre;
  @Column(nullable=false,length=80)
  private String apellido;
  @Column(nullable=false,unique=true,length=150)
  private String correo;
  @Column(length=10)
  private String telefono;
  @Column(name="contrasena_hash",nullable=false,length=255)
  private String contrasenaHash;
  @Enumerated(EnumType.STRING) @Column(nullable=false,length=10)
  private Rol rol;
  @Column(nullable=false)
  private boolean activo;
  @Column(nullable=false,updatable=false)
  private OffsetDateTime fechaRegistro;
  @PrePersist public void crear() { if (fechaRegistro == null) fechaRegistro=OffsetDateTime.now(); }
  public Long getId() { return id; }
  public void setId(Long v) { this.id=v; }
  public String getNombre() { return nombre; }
  public void setNombre(String v) { this.nombre=v; }
  public String getApellido() { return apellido; }
  public void setApellido(String v) { this.apellido=v; }
  public String getCorreo() { return correo; }
  public void setCorreo(String v) { this.correo=v; }
  public String getTelefono() { return telefono; }
  public void setTelefono(String v) { this.telefono=v; }
  public String getContrasenaHash() { return contrasenaHash; }
  public void setContrasenaHash(String v) { this.contrasenaHash=v; }
  public Rol getRol() { return rol; }
  public void setRol(Rol v) { this.rol=v; }
  public boolean isActivo() { return activo; }
  public void setActivo(boolean v) { this.activo=v; }
  public OffsetDateTime getFechaRegistro() { return fechaRegistro; }
  public void setFechaRegistro(OffsetDateTime v) { this.fechaRegistro=v; }
}