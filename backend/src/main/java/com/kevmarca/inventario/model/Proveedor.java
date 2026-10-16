package com.kevmarca.inventario.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// 📌 Tabla "proveedor". RUC único de 13 dígitos
@Entity
@Table(name = "proveedor")
public class Proveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El RUC es obligatorio")
    @Pattern(regexp = "\\d{13}", message = "El RUC debe tener 13 dígitos")
    @Column(nullable = false, unique = true, length = 13)
    private String ruc;

    @NotBlank(message = "La razón social es obligatoria")
    @Size(max = 120)
    @Column(name = "razon_social", nullable = false, length = 120)
    private String razonSocial;

    @Pattern(regexp = "^$|\\d{7,10}", message = "El teléfono debe tener entre 7 y 10 dígitos")
    @Column(length = 15)
    private String telefono;

    @Email(message = "El correo no es válido")
    @Column(length = 100)
    private String email;

    @Size(max = 200)
    @Column(length = 200)
    private String direccion;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRuc() { return ruc; }
    public void setRuc(String ruc) { this.ruc = ruc; }
    public String getRazonSocial() { return razonSocial; }
    public void setRazonSocial(String razonSocial) { this.razonSocial = razonSocial; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
}
