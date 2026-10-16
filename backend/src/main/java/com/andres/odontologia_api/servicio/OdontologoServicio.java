package com.andres.odontologia_api.servicio;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.andres.odontologia_api.modelo.Odontologo;
import com.andres.odontologia_api.repositorio.OdontologoRepositorio;

// Gestiona las operaciones de los odontologos
@Service
public class OdontologoServicio {

    // Conexion con el repositorio de odontologos
    private final OdontologoRepositorio repositorio;

    // Constructor para inyectar el repositorio
    public OdontologoServicio(OdontologoRepositorio repositorio) {
        this.repositorio = repositorio;
    }

    // GET: listar todos los odontologos
    public List<Odontologo> listar() {
        return repositorio.findAll();
    }

    // GET: buscar odontologo por identificador
    public Odontologo buscarPorId(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Odontologo no encontrado"
                ));
    }

    // POST: registrar un nuevo odontologo
    public Odontologo guardar(Odontologo odontologo) {
        odontologo.setId(null);
        return repositorio.save(odontologo);
    }

    // PUT: actualizar datos del odontologo
    @Transactional
    public Odontologo actualizar(Long id, Odontologo datos) {

        Odontologo odontologo = buscarPorId(id);

        odontologo.setNombre(datos.getNombre());
        odontologo.setApellido(datos.getApellido());
        odontologo.setEspecialidad(datos.getEspecialidad());
        odontologo.setTelefono(datos.getTelefono());
        odontologo.setCorreo(datos.getCorreo());

        return repositorio.save(odontologo);
    }

    // DELETE: eliminar un odontologo
    @Transactional
    public void eliminar(Long id) {

        Odontologo odontologo = buscarPorId(id);

        repositorio.delete(odontologo);
        repositorio.flush();
    }
}