package com.sistema.tecnosoporte.dto;
import com.sistema.tecnosoporte.enums.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
public final class Datos {
 private Datos() {}
 public record Registro(
  @NotBlank @Size(max=80) String nombre,
  @NotBlank @Size(max=80) String apellido,
  @NotBlank @Email @Size(max=150) String correo,
  @NotBlank @Size(min=8,max=72) String contrasena,
  @Pattern(regexp="09[0-9]{8}",message="El telefono debe tener 10 digitos y comenzar con 09") String telefono
 ) {}
 public record Login(@NotBlank String correo, @NotBlank String contrasena) {}
 public record UsuarioActualizar(@NotBlank @Size(max=80) String nombre,@NotBlank @Size(max=80) String apellido,
  @NotBlank @Email String correo, @Pattern(regexp="09[0-9]{8}",message="Telefono ecuatoriano invalido") String telefono, Boolean activo) {}
 public record UsuarioVista(Long id,String nombre,String apellido,String correo,String telefono,Rol rol,boolean activo) {}
 public record AuthVista(String token,String tipo,UsuarioVista usuario) {}
 public record TecnicoEntrada(@NotBlank @Size(max=80) String nombre,@NotBlank @Size(max=80) String apellido,
   @NotBlank @Size(max=120) String especialidad,@Pattern(regexp="09[0-9]{8}",message="Telefono ecuatoriano invalido") String telefono,Boolean activo) {}
 public record TecnicoVista(Long id,String nombre,String apellido,String especialidad,String telefono,boolean activo) {}
 public record EquipoEntrada(@NotNull TipoEquipo tipo,@NotBlank @Size(max=80) String marca,@NotBlank @Size(max=100) String modelo,
  @Size(max=100) String numeroSerie,@Size(max=1000) String descripcion,Long clienteId) {}
 public record EquipoVista(Long id,TipoEquipo tipo,String marca,String modelo,String numeroSerie,String descripcion,boolean activo,UsuarioVista cliente) {}
 public record ServicioEntrada(@NotBlank @Size(max=120) String nombre,@Size(max=2000) String descripcion,
  @NotNull @DecimalMin("0.0") @Digits(integer=8,fraction=2) BigDecimal precio,Boolean activo) {}
 public record ServicioVista(Long id,String nombre,String descripcion,BigDecimal precio,boolean activo) {}
 public record TicketEntrada(@NotNull Long equipoId,@NotBlank @Size(min=10,max=3000) String descripcionProblema,@NotNull Prioridad prioridad) {}
 public record TicketEditar(@NotBlank @Size(min=10,max=3000) String descripcionProblema,@NotNull Prioridad prioridad) {}
 public record Asignar(@NotNull Long tecnicoId) {}
 public record EstadoEntrada(@NotNull EstadoTicket estado,@Size(max=3000) String diagnostico,@Size(max=3000) String solucion) {}
 public record DetalleEntrada(@NotNull Long servicioId,@Size(max=2000) String observacion) {}
 public record ServiciosEntrada(@NotEmpty @Size(max=30) List<@Valid @NotNull DetalleEntrada> servicios) {}
 public record DetalleVista(Long id,Long servicioId,String servicio,BigDecimal precioAplicado,String observacion) {}
 public record TicketVista(Long id,EquipoVista equipo,TecnicoVista tecnico,String descripcionProblema,
  String diagnostico,String solucion,Prioridad prioridad,EstadoTicket estado,OffsetDateTime fechaCreacion,
  OffsetDateTime fechaActualizacion,OffsetDateTime fechaCierre,List<DetalleVista> servicios,BigDecimal total) {}
}
