package com.sistema.tecnosoporte.controladores;
import com.sistema.tecnosoporte.dto.Datos.*;
import com.sistema.tecnosoporte.entidades.*;
import com.sistema.tecnosoporte.enums.Rol;
import com.sistema.tecnosoporte.errores.ExcepcionApi;
import com.sistema.tecnosoporte.servicios.BaseServicio;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/equipos")
public class EquipoControlador {
 private final BaseServicio db;public EquipoControlador(BaseServicio db){this.db=db;}
 @GetMapping @Transactional(readOnly=true) public List<EquipoVista> todos(){return (db.admin()?db.equipos.findAll():db.equipos.findByClienteId(db.actual().getId())).stream().map(db::vista).toList();}
 @GetMapping("/{id}") @Transactional(readOnly=true) public EquipoVista uno(@PathVariable Long id){Equipo e=db.equipo(id);db.propio(e.getCliente());return db.vista(e);}
 @PostMapping @Transactional public ResponseEntity<EquipoVista> crear(@Valid @RequestBody EquipoEntrada r){
  Usuario u=resolverCliente(r.clienteId());
  if(!u.isActivo()||u.getRol()!=Rol.CLIENTE)throw ExcepcionApi.malo("El propietario debe ser un CLIENTE activo");
  db.validarSerie(r.numeroSerie(),null);
  Equipo e=new Equipo();e.setCliente(u);e.setActivo(true);aplicar(e,r);
  return ResponseEntity.status(HttpStatus.CREATED).body(db.vista(db.equipos.save(e)));
 }
 @PutMapping("/{id}") @Transactional public EquipoVista editar(@PathVariable Long id,@Valid @RequestBody EquipoEntrada r){
  Equipo e=db.equipo(id);db.propio(e.getCliente());
  if(!db.admin() && r.clienteId()!=null && !r.clienteId().equals(e.getCliente().getId())) throw ExcepcionApi.prohibido();
  if(!e.isActivo())throw ExcepcionApi.conflicto("El equipo esta inactivo");
  if(db.admin()&&r.clienteId()!=null&&!e.getCliente().getId().equals(r.clienteId())) {
   if(db.tickets.existsByEquipoId(id))throw ExcepcionApi.conflicto("No puedes cambiar el propietario de un equipo con historial");
   Usuario u=db.usuario(r.clienteId());if(!u.isActivo()||u.getRol()!=Rol.CLIENTE)throw ExcepcionApi.malo("Cliente invalido");e.setCliente(u);
  }
  db.validarSerie(r.numeroSerie(),id);aplicar(e,r);return db.vista(db.equipos.save(e));
 }
 @DeleteMapping("/{id}") @Transactional public ResponseEntity<Void> borrar(@PathVariable Long id){
  Equipo e=db.equipo(id);db.propio(e.getCliente());e.setActivo(false);db.equipos.save(e);return ResponseEntity.noContent().build();
 }
 private Usuario resolverCliente(Long clienteId){
  if(!db.admin()){
   if(clienteId!=null&&!clienteId.equals(db.actual().getId()))throw ExcepcionApi.prohibido();
   return db.actual();
  }
  if(clienteId==null)throw ExcepcionApi.malo("Un ADMIN debe indicar clienteId");return db.usuario(clienteId);
 }
 private void aplicar(Equipo e,EquipoEntrada r){e.setTipo(r.tipo());e.setMarca(r.marca().trim());e.setModelo(r.modelo().trim());
  e.setNumeroSerie(r.numeroSerie()==null||r.numeroSerie().isBlank()?null:r.numeroSerie().trim());e.setDescripcion(r.descripcion());}
}
