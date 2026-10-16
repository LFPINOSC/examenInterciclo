package com.andres.odontologia_api.servicio;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.andres.odontologia_api.modelo.Paciente;
import com.andres.odontologia_api.repositorio.PacienteRepositorio;

// Gestiona la informacion de los pacientes
@Service
public class PacienteServicio {

    // Repositorio para acceder a la tabla pacientes
    private final PacienteRepositorio repositorio;

    // Constructor para inyectar el repositorio
    public PacienteServicio(PacienteRepositorio repositorio) {
        this.repositorio = repositorio;
    }

    // GET: listar pacientes registrados
    public List<Paciente> listar() {
        return repositorio.findAll();
    }

    // GET: buscar paciente por ID
    public Paciente buscarPorId(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Paciente no encontrado"
                ));
    }

    // GET: buscar paciente por cedula
    public Paciente buscarPorCedula(String cedula) {
        return repositorio.findByCedula(cedula)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Paciente no encontrado"
                ));
    }

    // POST: registrar un paciente
    public Paciente guardar(Paciente paciente) {

        // Evita registrar cedulas duplicadas
        if (repositorio.existsByCedula(paciente.getCedula())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La cedula ya esta registrada"
            );
        }

        paciente.setId(null);

        // La vinculacion de cuentas se hara en el modulo de seguridad
        paciente.setUsuario(null);

        return repositorio.save(paciente);
    }

    // PUT: actualizar datos del paciente
    @Transactional
    public Paciente actualizar(Long id, Paciente datos) {

        Paciente paciente = buscarPorId(id);

        // Verifica que la nueva cedula no pertenezca a otro paciente
        repositorio.findByCedula(datos.getCedula())
                .ifPresent(existente -> {
                    if (!existente.getId().equals(id)) {
                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "La cedula pertenece a otro paciente"
                        );
                    }
                });

        paciente.setCedula(datos.getCedula());
        paciente.setNombre(datos.getNombre());
        paciente.setApellido(datos.getApellido());
        paciente.setTelefono(datos.getTelefono());
        paciente.setCorreo(datos.getCorreo());
        paciente.setDireccion(datos.getDireccion());

        // No modificamos aqui la cuenta de acceso del paciente
        return repositorio.save(paciente);
    }

    // DELETE: eliminar paciente por ID
    @Transactional
    public void eliminar(Long id) {

        Paciente paciente = buscarPorId(id);

        repositorio.delete(paciente);
        repositorio.flush();
    }
}