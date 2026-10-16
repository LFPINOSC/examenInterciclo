package com.andres.odontologia_api.servicio;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.andres.odontologia_api.modelo.Servicio;
import com.andres.odontologia_api.repositorio.ServicioRepositorio;

// Contiene la logica de negocio de los tratamientos odontologicos
@Service
public class ServicioServicio {

    // Repositorio que permite acceder a PostgreSQL
    private final ServicioRepositorio repositorio;

    // Inyeccion de dependencias mediante constructor
    public ServicioServicio(ServicioRepositorio repositorio) {
        this.repositorio = repositorio;
    }

    // GET: consultar todos los tratamientos
    public List<Servicio> listar() {
        return repositorio.findAll();
    }

    // GET: buscar un tratamiento por ID
    public Servicio buscarPorId(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Servicio no encontrado"
                ));
    }

    // POST: registrar un nuevo tratamiento
    public Servicio guardar(Servicio servicio) {
        servicio.setId(null);
        return repositorio.save(servicio);
    }

    // PUT: actualizar un tratamiento existente
    @Transactional
    public Servicio actualizar(Long id, Servicio datos) {

        Servicio servicio = buscarPorId(id);

        servicio.setNombre(datos.getNombre());
        servicio.setDescripcion(datos.getDescripcion());
        servicio.setPrecio(datos.getPrecio());

        return repositorio.save(servicio);
    }

    // DELETE: eliminar un tratamiento por ID
    @Transactional
    public void eliminar(Long id) {

        Servicio servicio = buscarPorId(id);

        repositorio.delete(servicio);
        repositorio.flush();
    }
}