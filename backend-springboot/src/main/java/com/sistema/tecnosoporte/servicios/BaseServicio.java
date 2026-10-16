package com.sistema.tecnosoporte.servicios;
import com.sistema.tecnosoporte.dto.Datos.*;
import com.sistema.tecnosoporte.entidades.*;
import com.sistema.tecnosoporte.enums.Rol;
import com.sistema.tecnosoporte.errores.ExcepcionApi;
import com.sistema.tecnosoporte.repositorios.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.*;
@Service
public class BaseServicio {
 public final UsuarioRepositorio usuarios; public final TecnicoRepositorio tecnicos; public final EquipoRepositorio equipos;
 public final ServicioRepositorio servicios; public final TicketRepositorio tickets; public final DetalleServicioRepositorio detalles;
 public BaseServicio(UsuarioRepositorio usuarios,TecnicoRepositorio tecnicos,EquipoRepositorio equipos,ServicioRepositorio servicios,TicketRepositorio tickets,DetalleServicioRepositorio detalles) {
  this.usuarios=usuarios;this.tecnicos=tecnicos;this.equipos=equipos;this.servicios=servicios;this.tickets=tickets;this.detalles=detalles;
 }
 public Usuario actual() {
  try { return usuarios.findById(Long.parseLong(SecurityContextHolder.getContext().getAuthentication().getName()))
    .filter(Usuario::isActivo).orElseThrow(ExcepcionApi::prohibido); }
  catch(NullPointerException|NumberFormatException ex) { throw ExcepcionApi.prohibido(); }
 }
 public boolean admin() {return actual().getRol()==Rol.ADMIN;}
 public void propio(Usuario propietario) {if(!admin()&&!actual().getId().equals(propietario.getId())) throw ExcepcionApi.prohibido();}
 public Usuario usuario(Long id) {return usuarios.findById(id).orElseThrow(()->ExcepcionApi.noExiste("Usuario"));}
 public Tecnico tecnico(Long id) {return tecnicos.findById(id).orElseThrow(()->ExcepcionApi.noExiste("Tecnico"));}
 public Equipo equipo(Long id) {return equipos.findById(id).orElseThrow(()->ExcepcionApi.noExiste("Equipo"));}
 public Servicio servicio(Long id) {return servicios.findById(id).orElseThrow(()->ExcepcionApi.noExiste("Servicio"));}
 public Ticket ticket(Long id) {return tickets.findById(id).orElseThrow(()->ExcepcionApi.noExiste("Ticket"));}
 public UsuarioVista vista(Usuario u) {return new UsuarioVista(u.getId(),u.getNombre(),u.getApellido(),u.getCorreo(),u.getTelefono(),u.getRol(),u.isActivo());}
 public TecnicoVista vista(Tecnico t) {return t==null?null:new TecnicoVista(t.getId(),t.getNombre(),t.getApellido(),t.getEspecialidad(),t.getTelefono(),t.isActivo());}
 public EquipoVista vista(Equipo e) {return new EquipoVista(e.getId(),e.getTipo(),e.getMarca(),e.getModelo(),e.getNumeroSerie(),e.getDescripcion(),e.isActivo(),vista(e.getCliente()));}
 public ServicioVista vista(Servicio s) {return new ServicioVista(s.getId(),s.getNombre(),s.getDescripcion(),s.getPrecio(),s.isActivo());}
 public TicketVista vista(Ticket t) {
  var ds=detalles.findByTicketIdOrderByIdAsc(t.getId()).stream().map(d->new DetalleVista(d.getId(),d.getServicio().getId(),d.getServicio().getNombre(),d.getPrecioAplicado(),d.getObservacion())).toList();
  var total=ds.stream().map(DetalleVista::precioAplicado).reduce(java.math.BigDecimal.ZERO,java.math.BigDecimal::add);
  return new TicketVista(t.getId(),vista(t.getEquipo()),vista(t.getTecnico()),t.getDescripcionProblema(),t.getDiagnostico(),t.getSolucion(),t.getPrioridad(),t.getEstado(),t.getFechaCreacion(),t.getFechaActualizacion(),t.getFechaCierre(),ds,total);
 }
 public void validarSerie(String serie,Long id) {
  if(serie==null||serie.isBlank())return;
  equipos.findByNumeroSerieIgnoreCase(serie.trim()).ifPresent(e->{if(id==null||!e.getId().equals(id))throw ExcepcionApi.conflicto("Numero de serie ya registrado");});
 }
}
