package com.sistema.tecnosoporte.controladores;
import com.sistema.tecnosoporte.dto.Datos.*;
import com.sistema.tecnosoporte.entidades.*;
import com.sistema.tecnosoporte.enums.*;
import com.sistema.tecnosoporte.errores.ExcepcionApi;
import com.sistema.tecnosoporte.servicios.BaseServicio;
import jakarta.validation.Valid;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/tickets")
public class TicketControlador {
 private final BaseServicio db;public TicketControlador(BaseServicio db){this.db=db;}
 private Ticket autorizado(Long id){Ticket t=db.ticket(id);db.propio(t.getEquipo().getCliente());return t;}
 @GetMapping @Transactional(readOnly=true) public List<TicketVista> todos(){
  return (db.admin()?db.tickets.findAll():db.tickets.findByEquipoClienteId(db.actual().getId())).stream().map(db::vista).toList();
 }
 @GetMapping("/{id}") @Transactional(readOnly=true) public TicketVista uno(@PathVariable Long id){return db.vista(autorizado(id));}
 @PostMapping @Transactional public ResponseEntity<TicketVista> crear(@Valid @RequestBody TicketEntrada r){
  Equipo e=db.equipo(r.equipoId());db.propio(e.getCliente());
  if(!e.isActivo()||!e.getCliente().isActivo())throw ExcepcionApi.conflicto("El equipo o su propietario esta inactivo");
  Ticket t=new Ticket();t.setEquipo(e);t.setDescripcionProblema(r.descripcionProblema().trim());t.setPrioridad(r.prioridad());t.setEstado(EstadoTicket.PENDIENTE);
  return ResponseEntity.status(HttpStatus.CREATED).body(db.vista(db.tickets.save(t)));
 }
 @PutMapping("/{id}") @Transactional public TicketVista editar(@PathVariable Long id,@Valid @RequestBody TicketEditar r){
  Ticket t=autorizado(id);
  if(t.getEstado()!=EstadoTicket.PENDIENTE)throw ExcepcionApi.conflicto("Solo se puede editar un ticket PENDIENTE");
  t.setDescripcionProblema(r.descripcionProblema().trim());t.setPrioridad(r.prioridad());return db.vista(db.tickets.save(t));
 }
 @DeleteMapping("/{id}") @Transactional public ResponseEntity<Void> borrar(@PathVariable Long id){
  Ticket t=autorizado(id);
  if(t.getEstado()!=EstadoTicket.PENDIENTE||t.getTecnico()!=null||!db.detalles.findByTicketIdOrderByIdAsc(id).isEmpty())throw ExcepcionApi.conflicto("Solo se elimina un ticket PENDIENTE sin asignacion ni servicios");
  db.tickets.delete(t);return ResponseEntity.noContent().build();
 }
 @PutMapping("/{id}/asignar") @PreAuthorize("hasRole('ADMIN')") @Transactional
 public TicketVista asignar(@PathVariable Long id,@Valid @RequestBody Asignar r){
  Ticket t=db.ticket(id);
  if(t.getEstado()!=EstadoTicket.PENDIENTE&&t.getEstado()!=EstadoTicket.ASIGNADO)throw ExcepcionApi.conflicto("Solo puedes asignar tickets PENDIENTES o ASIGNADOS");
  Tecnico tec=db.tecnico(r.tecnicoId());if(!tec.isActivo())throw ExcepcionApi.conflicto("El tecnico esta inactivo");
  t.setTecnico(tec);t.setEstado(EstadoTicket.ASIGNADO);return db.vista(db.tickets.save(t));
 }
 @PutMapping("/{id}/estado") @PreAuthorize("hasRole('ADMIN')") @Transactional
 public TicketVista cambiarEstado(@PathVariable Long id,@Valid @RequestBody EstadoEntrada r){
  Ticket t=db.ticket(id);EstadoTicket antes=t.getEstado(),despues=r.estado();
  boolean valido=switch(antes){
   case PENDIENTE -> despues==EstadoTicket.ASIGNADO && t.getTecnico()!=null;
   case ASIGNADO -> despues==EstadoTicket.EN_PROCESO;
   case EN_PROCESO -> despues==EstadoTicket.RESUELTO;
   case RESUELTO -> despues==EstadoTicket.CERRADO;
   case CERRADO -> false;
  };
  if(!valido)throw ExcepcionApi.conflicto("Transicion de estado no permitida: "+antes+" -> "+despues);
  if(antes==EstadoTicket.PENDIENTE)throw ExcepcionApi.malo("Usa /asignar para asignar un tecnico");
  if(r.diagnostico()!=null)t.setDiagnostico(r.diagnostico().trim());
  if(r.solucion()!=null)t.setSolucion(r.solucion().trim());
  if(despues==EstadoTicket.RESUELTO&&(t.getDiagnostico()==null||t.getDiagnostico().isBlank()||t.getSolucion()==null||t.getSolucion().isBlank()))
    throw ExcepcionApi.malo("Para RESUELTO se requieren diagnostico y solucion");
  t.setEstado(despues);if(despues==EstadoTicket.CERRADO)t.setFechaCierre(OffsetDateTime.now());
  return db.vista(db.tickets.save(t));
 }
 @PutMapping("/{id}/servicios") @PreAuthorize("hasRole('ADMIN')") @Transactional
 public TicketVista guardarServicios(@PathVariable Long id,@Valid @RequestBody ServiciosEntrada r){
  Ticket t=db.ticket(id);
  if(t.getEstado()!=EstadoTicket.ASIGNADO&&t.getEstado()!=EstadoTicket.EN_PROCESO)throw ExcepcionApi.conflicto("Los servicios solo se editan en tickets ASIGNADOS o EN_PROCESO");
  Set<Long> ids=new HashSet<>();List<DetalleServicio> nuevos=new ArrayList<>();
  for(DetalleEntrada item:r.servicios()){
   if(!ids.add(item.servicioId()))throw ExcepcionApi.malo("Un mismo servicio no puede repetirse en el ticket");
   Servicio servicio=db.servicio(item.servicioId());if(!servicio.isActivo())throw ExcepcionApi.conflicto("Servicio inactivo: "+servicio.getNombre());
   DetalleServicio d=new DetalleServicio();d.setTicket(t);d.setServicio(servicio);d.setPrecioAplicado(servicio.getPrecio());d.setObservacion(item.observacion());nuevos.add(d);
  }
  var anteriores=db.detalles.findByTicketIdOrderByIdAsc(id);
  if(!anteriores.isEmpty()){db.detalles.deleteAllInBatch(anteriores);db.detalles.flush();}
  db.detalles.saveAll(nuevos);db.detalles.flush();
  return db.vista(t);
 }
}
