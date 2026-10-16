package com.jordy.ambulancias.controladores;
import com.jordy.ambulancias.entidades.*;import com.jordy.ambulancias.repositorios.*;
import jakarta.validation.Valid;import org.springframework.security.core.Authentication;import org.springframework.web.bind.annotation.*;import org.springframework.web.server.ResponseStatusException;import org.springframework.http.HttpStatus;
import java.util.*;
@RestController @RequestMapping("/api/solicitudes") public class SolicitudController {
 private final SolicitudRepositorio repo;private final UsuarioRepositorio usuarios;
 public SolicitudController(SolicitudRepositorio r,UsuarioRepositorio u){repo=r;usuarios=u;}
 private Usuario usuario(Authentication a){return usuarios.findByCorreoIgnoreCase(a.getName()).orElseThrow();}
 private boolean admin(Usuario u){return "ADMIN".equals(u.rol);}
 private Solicitud propia(Long id,Usuario u){Solicitud s=repo.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));if(!admin(u)&&!Objects.equals(s.usuarioId,u.id))throw new ResponseStatusException(HttpStatus.FORBIDDEN);return s;}
 @GetMapping public List<Solicitud> listar(Authentication a){Usuario u=usuario(a);return repo.findAll().stream().filter(s->admin(u)||Objects.equals(s.usuarioId,u.id)).toList();}
 @GetMapping("/{id}") public Solicitud obtener(@PathVariable Long id,Authentication a){return propia(id,usuario(a));}
 @PostMapping public Solicitud crear(@Valid @RequestBody Solicitud d,Authentication a){d.id=null;d.usuarioId=usuario(a).id;d.estado="PENDIENTE";return repo.save(d);}
 @PutMapping("/{id}") public Solicitud editar(@PathVariable Long id,@Valid @RequestBody Solicitud d,Authentication a){Solicitud original=propia(id,usuario(a));if(!"PENDIENTE".equals(original.estado))throw new ResponseStatusException(HttpStatus.CONFLICT,"Solo editar solicitudes pendientes");d.id=id;d.usuarioId=original.usuarioId;d.estado=original.estado;return repo.save(d);}
 @DeleteMapping("/{id}") public void borrar(@PathVariable Long id,Authentication a){Solicitud s=propia(id,usuario(a));if(!"PENDIENTE".equals(s.estado))throw new ResponseStatusException(HttpStatus.CONFLICT,"Solo eliminar solicitudes pendientes");repo.delete(s);}
}
