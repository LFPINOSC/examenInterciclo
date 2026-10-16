package com.sistema.tecnosoporte.controladores;
import com.sistema.tecnosoporte.dto.Datos.*;
import com.sistema.tecnosoporte.entidades.Usuario;
import com.sistema.tecnosoporte.enums.Rol;
import com.sistema.tecnosoporte.errores.ExcepcionApi;
import com.sistema.tecnosoporte.seguridad.JwtServicio;
import com.sistema.tecnosoporte.servicios.BaseServicio;
import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
@RestController @RequestMapping("/api/auth")
public class AuthControlador {
 private final BaseServicio db;private final PasswordEncoder password;private final JwtServicio jwt;
 public AuthControlador(BaseServicio db,PasswordEncoder password,JwtServicio jwt) {this.db=db;this.password=password;this.jwt=jwt;}
 @PostMapping("/registro") @Transactional
 public ResponseEntity<UsuarioVista> registrar(@Valid @RequestBody Registro r) {
  String correo=r.correo().trim().toLowerCase();
  if(db.usuarios.existsByCorreoIgnoreCase(correo))throw ExcepcionApi.conflicto("El correo ya esta registrado");
  Usuario u=new Usuario();u.setNombre(r.nombre().trim());u.setApellido(r.apellido().trim());u.setCorreo(correo);
  u.setTelefono(r.telefono());u.setContrasenaHash(password.encode(r.contrasena()));u.setRol(Rol.CLIENTE);u.setActivo(true);
  return ResponseEntity.status(HttpStatus.CREATED).body(db.vista(db.usuarios.save(u)));
 }
 @PostMapping("/login")
 public AuthVista ingresar(@Valid @RequestBody Login r) {
  Usuario u=db.usuarios.findByCorreoIgnoreCase(r.correo().trim()).orElseThrow(()->ExcepcionApi.malo("Credenciales incorrectas"));
  if(!u.isActivo()||!password.matches(r.contrasena(),u.getContrasenaHash()))throw new ExcepcionApi(HttpStatus.UNAUTHORIZED,"Credenciales incorrectas");
  return new AuthVista(jwt.crear(u.getId()),"Bearer",db.vista(u));
 }
}
