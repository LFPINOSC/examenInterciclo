package com.jordy.ambulancias.controladores;
import com.jordy.ambulancias.entidades.Conductor;import com.jordy.ambulancias.repositorios.ConductorRepositorio;
import jakarta.validation.Valid;import org.springframework.web.bind.annotation.*;import org.springframework.web.server.ResponseStatusException;import org.springframework.http.HttpStatus;
import java.util.*;
@RestController @RequestMapping("/api/conductores") public class ConductorController {
 private final ConductorRepositorio repo;public ConductorController(ConductorRepositorio r){repo=r;}
 @GetMapping public List<Conductor> listar(){return repo.findAll();}
 @GetMapping("/{id}") public Conductor buscar(@PathVariable Long id){return repo.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));}
 @PostMapping public Conductor crear(@Valid @RequestBody Conductor dato){dato.id=null;return repo.save(dato);}
 @PutMapping("/{id}") public Conductor editar(@PathVariable Long id,@Valid @RequestBody Conductor dato){buscar(id);dato.id=id;return repo.save(dato);}
 @DeleteMapping("/{id}") public void borrar(@PathVariable Long id){buscar(id);repo.deleteById(id);}
}
