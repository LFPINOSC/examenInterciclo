package com.jordy.ambulancias.controladores;
import com.jordy.ambulancias.entidades.*;import com.jordy.ambulancias.repositorios.*;
import jakarta.validation.Valid;import org.springframework.web.bind.annotation.*;import org.springframework.http.*;import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;import java.util.*;
@RestController @RequestMapping("/api/asignaciones") public class AsignacionController {
 private final AsignacionRepositorio repo;private final SolicitudRepositorio solicitudes;private final AmbulanciaRepositorio ambulancias;private final ConductorRepositorio conductores;
 public AsignacionController(AsignacionRepositorio a,SolicitudRepositorio s,AmbulanciaRepositorio b,ConductorRepositorio c){repo=a;solicitudes=s;ambulancias=b;conductores=c;}
 private <T> T obtener(Optional<T> valor){return valor.orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Referencia inexistente"));}
 @GetMapping public List<Asignacion> listar(){return repo.findAll();}
 @PostMapping @Transactional public Asignacion crear(@Valid @RequestBody Asignacion d){
  Solicitud s=obtener(solicitudes.findById(d.solicitudId));Ambulancia a=obtener(ambulancias.findById(d.ambulanciaId));Conductor c=obtener(conductores.findById(d.conductorId));
  if(!"PENDIENTE".equals(s.estado)||!"DISPONIBLE".equals(a.estado)||!"DISPONIBLE".equals(c.estado)||repo.existsBySolicitudId(d.solicitudId))throw new ResponseStatusException(HttpStatus.CONFLICT,"Solicitud o recursos no disponibles");
  d.id=null;d.estado="EN_CURSO";Asignacion guardada=repo.save(d);s.estado="ASIGNADA";a.estado="OCUPADA";c.estado="OCUPADO";solicitudes.save(s);ambulancias.save(a);conductores.save(c);return guardada;
 }
 @PatchMapping("/{id}/finalizar") @Transactional public Asignacion finalizar(@PathVariable Long id){Asignacion d=obtener(repo.findById(id));if(!"EN_CURSO".equals(d.estado))throw new ResponseStatusException(HttpStatus.CONFLICT,"Asignación ya terminada");d.estado="FINALIZADA";Solicitud s=obtener(solicitudes.findById(d.solicitudId));s.estado="FINALIZADA";Ambulancia a=obtener(ambulancias.findById(d.ambulanciaId));a.estado="DISPONIBLE";Conductor c=obtener(conductores.findById(d.conductorId));c.estado="DISPONIBLE";solicitudes.save(s);ambulancias.save(a);conductores.save(c);return repo.save(d);}
 @DeleteMapping("/{id}") @Transactional public void borrar(@PathVariable Long id){Asignacion d=obtener(repo.findById(id));if("EN_CURSO".equals(d.estado))throw new ResponseStatusException(HttpStatus.CONFLICT,"Finaliza la asignación antes de eliminarla");repo.delete(d);}
}
