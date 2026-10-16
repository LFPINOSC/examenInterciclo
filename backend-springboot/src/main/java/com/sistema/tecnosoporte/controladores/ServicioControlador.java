package com.sistema.tecnosoporte.controladores;
import com.sistema.tecnosoporte.dto.Datos.*;
import com.sistema.tecnosoporte.entidades.Servicio;
import com.sistema.tecnosoporte.errores.ExcepcionApi;
import com.sistema.tecnosoporte.servicios.BaseServicio;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/servicios")
public class ServicioControlador {
 private final BaseServicio db;public ServicioControlador(BaseServicio db){this.db=db;}
 @GetMapping public List<ServicioVista> todos(){return (db.admin()?db.servicios.findAll():db.servicios.findByActivoTrue()).stream().map(db::vista).toList();}
 @GetMapping("/{id}") public ServicioVista uno(@PathVariable Long id){Servicio s=db.servicio(id);if(!s.isActivo()&&!db.admin())throw ExcepcionApi.noExiste("Servicio");return db.vista(s);}
 @PostMapping @PreAuthorize("hasRole('ADMIN')") @Transactional public ResponseEntity<ServicioVista> crear(@Valid @RequestBody ServicioEntrada r){
  validarNombre(r.nombre(),null);Servicio s=new Servicio();aplicar(s,r);return ResponseEntity.status(HttpStatus.CREATED).body(db.vista(db.servicios.save(s)));
 }
 @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") @Transactional public ServicioVista editar(@PathVariable Long id,@Valid @RequestBody ServicioEntrada r){
  Servicio s=db.servicio(id);validarNombre(r.nombre(),id);aplicar(s,r);return db.vista(db.servicios.save(s));
 }
 @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") @Transactional public ResponseEntity<Void> borrar(@PathVariable Long id){
  Servicio s=db.servicio(id);s.setActivo(false);db.servicios.save(s);return ResponseEntity.noContent().build();
 }
 private void validarNombre(String nombre,Long id){db.servicios.findByNombreIgnoreCase(nombre.trim()).ifPresent(s->{if(id==null||!id.equals(s.getId()))throw ExcepcionApi.conflicto("Nombre de servicio duplicado");});}
 private void aplicar(Servicio s,ServicioEntrada r){s.setNombre(r.nombre().trim());s.setDescripcion(r.descripcion());s.setPrecio(r.precio());if(r.activo()!=null)s.setActivo(r.activo());else if(s.getId()==null)s.setActivo(true);}
}
