package com.sistema.tecnosoporte.controladores;
import com.sistema.tecnosoporte.dto.Datos.*;
import com.sistema.tecnosoporte.entidades.Usuario;
import com.sistema.tecnosoporte.errores.ExcepcionApi;
import com.sistema.tecnosoporte.servicios.BaseServicio;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/usuarios")
public class UsuarioControlador {
 private final BaseServicio db;
 public UsuarioControlador(BaseServicio db){this.db=db;}
 @GetMapping("/me") public UsuarioVista actual(){return db.vista(db.actual());}
 @GetMapping @PreAuthorize("hasRole('ADMIN')") public List<UsuarioVista> todos(){return db.usuarios.findAll().stream().map(db::vista).toList();}
 @GetMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public UsuarioVista uno(@PathVariable Long id){return db.vista(db.usuario(id));}
 @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") @Transactional
 public UsuarioVista editar(@PathVariable Long id,@Valid @RequestBody UsuarioActualizar r){
  Usuario u=db.usuario(id);
  db.usuarios.findByCorreoIgnoreCase(r.correo().trim()).ifPresent(o->{if(!o.getId().equals(id))throw ExcepcionApi.conflicto("Correo duplicado");});
  if(Boolean.FALSE.equals(r.activo()) && db.actual().getId().equals(id))throw ExcepcionApi.conflicto("No puedes desactivar tu propia cuenta ADMIN");
  u.setNombre(r.nombre().trim());u.setApellido(r.apellido().trim());u.setCorreo(r.correo().trim().toLowerCase());u.setTelefono(r.telefono());
  if(r.activo()!=null)u.setActivo(r.activo());
  return db.vista(db.usuarios.save(u));
 }
 @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") @Transactional
 public org.springframework.http.ResponseEntity<Void> desactivar(@PathVariable Long id){
  if(db.actual().getId().equals(id))throw ExcepcionApi.conflicto("No puedes desactivar tu propia cuenta ADMIN");
  Usuario u=db.usuario(id);u.setActivo(false);db.usuarios.save(u);return org.springframework.http.ResponseEntity.noContent().build();
 }
}
