package com.jordy.ambulancias.seguridad;
import com.jordy.ambulancias.entidades.Usuario;import com.jordy.ambulancias.repositorios.UsuarioRepositorio;
import org.springframework.boot.CommandLineRunner;import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;import org.springframework.security.crypto.password.PasswordEncoder;
@Component public class AdminInicial implements CommandLineRunner {
 private final UsuarioRepositorio repo;private final PasswordEncoder encoder;
 @Value("${app.admin.email:}") private String email;@Value("${app.admin.password:}") private String clave;
 public AdminInicial(UsuarioRepositorio r,PasswordEncoder e){repo=r;encoder=e;}
 public void run(String...args){if(email.isBlank()||clave.isBlank()){System.out.println("[AmbulanciaControl] Configura ADMIN_EMAIL y ADMIN_PASSWORD para crear ADMIN.");return;}if(clave.length()<8)throw new IllegalArgumentException("ADMIN_PASSWORD debe tener al menos 8 caracteres");if(repo.findByCorreoIgnoreCase(email).isEmpty()){Usuario u=new Usuario();u.nombre="Administrador";u.correo=email;u.claveHash=encoder.encode(clave);u.rol="ADMIN";repo.save(u);System.out.println("[AmbulanciaControl] ADMIN inicial creado.");}}
}
