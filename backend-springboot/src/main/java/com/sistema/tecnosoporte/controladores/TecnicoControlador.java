package com.sistema.tecnosoporte.controladores;
import com.sistema.tecnosoporte.dto.Datos.*;
import com.sistema.tecnosoporte.entidades.Tecnico;
import com.sistema.tecnosoporte.servicios.BaseServicio;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/tecnicos") @PreAuthorize("hasRole('ADMIN')")
public class TecnicoControlador {
 private final BaseServicio db;public TecnicoControlador(BaseServicio db){this.db=db;}
 @GetMapping public List<TecnicoVista> todos(){return db.tecnicos.findAll().stream().map(db::vista).toList();}
 @GetMapping("/{id}") public TecnicoVista uno(@PathVariable Long id){return db.vista(db.tecnico(id));}
 @PostMapping @Transactional public ResponseEntity<TecnicoVista> crear(@Valid @RequestBody TecnicoEntrada r){
  Tecnico t=new Tecnico();aplicar(t,r);return ResponseEntity.status(HttpStatus.CREATED).body(db.vista(db.tecnicos.save(t)));
 }
 @PutMapping("/{id}") @Transactional public TecnicoVista editar(@PathVariable Long id,@Valid @RequestBody TecnicoEntrada r){
  Tecnico t=db.tecnico(id);aplicar(t,r);return db.vista(db.tecnicos.save(t));
 }
 @DeleteMapping("/{id}") @Transactional public ResponseEntity<Void> borrar(@PathVariable Long id){
  Tecnico t=db.tecnico(id);t.setActivo(false);db.tecnicos.save(t);return ResponseEntity.noContent().build();
 }
 private void aplicar(Tecnico t,TecnicoEntrada r){
  t.setNombre(r.nombre().trim());t.setApellido(r.apellido().trim());t.setEspecialidad(r.especialidad().trim());
  t.setTelefono(r.telefono());if(r.activo()!=null)t.setActivo(r.activo());else if(t.getId()==null)t.setActivo(true);
 }
}
