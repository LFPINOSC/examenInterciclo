package com.jordy.ambulancias.controladores;
import com.jordy.ambulancias.entidades.Ambulancia;import com.jordy.ambulancias.repositorios.AmbulanciaRepositorio;
import jakarta.validation.Valid;import org.springframework.web.bind.annotation.*;import org.springframework.web.server.ResponseStatusException;import org.springframework.http.HttpStatus;
import java.util.*;
@RestController @RequestMapping("/api/ambulancias") public class AmbulanciaController {
 private final AmbulanciaRepositorio repo;public AmbulanciaController(AmbulanciaRepositorio r){repo=r;}
 @GetMapping public List<Ambulancia> listar(){return repo.findAll();}
 @GetMapping("/{id}") public Ambulancia buscar(@PathVariable Long id){return repo.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));}
 @PostMapping public Ambulancia crear(@Valid @RequestBody Ambulancia dato){dato.id=null;return repo.save(dato);}
 @PutMapping("/{id}") public Ambulancia editar(@PathVariable Long id,@Valid @RequestBody Ambulancia dato){buscar(id);dato.id=id;return repo.save(dato);}
 @DeleteMapping("/{id}") public void borrar(@PathVariable Long id){buscar(id);repo.deleteById(id);}
}
