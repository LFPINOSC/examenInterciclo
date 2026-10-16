package com.jordy.ambulancias.controladores;
import com.jordy.ambulancias.entidades.Usuario;import com.jordy.ambulancias.repositorios.UsuarioRepositorio;import com.jordy.ambulancias.seguridad.JwtServicio;
import jakarta.validation.constraints.*;import org.springframework.http.*;import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import java.util.*;
@RestController @RequestMapping("/api/auth") public class AuthController {
 private final UsuarioRepositorio repo;private final PasswordEncoder enc;private final JwtServicio jwt;
 public AuthController(UsuarioRepositorio r,PasswordEncoder e,JwtServicio j){repo=r;enc=e;jwt=j;}
 public record Registro(@NotBlank String nombre,@NotBlank @Email String correo,@NotBlank @Size(min=8) String contrasena){}
 public record Login(String correo,String contrasena){}
 @PostMapping("/registro") public ResponseEntity<?> registro(@RequestBody @jakarta.validation.Valid Registro d){if(repo.existsByCorreoIgnoreCase(d.correo()))return ResponseEntity.status(409).body(Map.of("mensaje","Correo ya registrado"));Usuario u=new Usuario();u.nombre=d.nombre();u.correo=d.correo().trim().toLowerCase();u.claveHash=enc.encode(d.contrasena());u.rol="OPERADOR";repo.save(u);return ResponseEntity.status(201).body(Map.of("mensaje","Operador registrado"));}
 @PostMapping("/login") public Map<String,Object> login(@RequestBody Login d){Usuario u=repo.findByCorreoIgnoreCase(d.correo()).orElseThrow(()->new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED,"Credenciales incorrectas"));if(!enc.matches(d.contrasena(),u.claveHash))throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED,"Credenciales incorrectas");return Map.of("token",jwt.generar(u.correo,u.rol),"correo",u.correo,"nombre",u.nombre,"rol",u.rol);}
 @GetMapping("/perfil") public Map<String,Object> perfil(Authentication auth){Usuario u=repo.findByCorreoIgnoreCase(auth.getName()).orElseThrow();return Map.of("correo",u.correo,"nombre",u.nombre,"rol",u.rol);}
}
