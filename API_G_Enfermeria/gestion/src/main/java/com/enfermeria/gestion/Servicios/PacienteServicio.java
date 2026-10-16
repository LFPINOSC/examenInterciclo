
package com.enfermeria.gestion.Servicios;

import com.enfermeria.gestion.DTO.*;
import com.enfermeria.gestion.Entidades.*;
import com.enfermeria.gestion.Excepciones.*;
import com.enfermeria.gestion.Repositorios.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PacienteServicio {

    private final PacienteRepositorio pacientes;
    private final ActividadRepositorio actividades;

    public PacienteServicio(
            PacienteRepositorio pacientes,
            ActividadRepositorio actividades) {
        this.pacientes = pacientes;
        this.actividades = actividades;
    }

    private Paciente buscar(Long id) {
        return pacientes.findById(id)
            .orElseThrow(() ->
                new RecursoNoEncontradoException(
                    "No existe un paciente con ID: " + id));
    }

    private PacienteResponse convertir(Paciente p) {
        return new PacienteResponse(
            p.getId(),
            p.getCedula(),
            p.getNombres(),
            p.getApellidos(),
            p.getFechaNacimiento(),
            p.getTelefono(),
            p.getDireccion(),
            p.getActivo()
        );
    }

    @Transactional(readOnly = true)
    public List<PacienteResponse> listar() {
        return pacientes.findAll()
            .stream()
            .map(this::convertir)
            .toList();
    }

    @Transactional(readOnly = true)
    public PacienteResponse obtener(Long id) {
        return convertir(buscar(id));
    }

    @Transactional
    public PacienteResponse crear(PacienteRequest datos) {

        if (pacientes.existsByCedula(datos.cedula())) {
            throw new ConflictoException(
                "Ya existe un paciente con la cédula: "
                + datos.cedula());
        }

        Paciente p = new Paciente();
        asignarDatos(p, datos);

        return convertir(pacientes.save(p));
    }

    @Transactional
    public PacienteResponse actualizar(
            Long id, PacienteRequest datos) {

        Paciente p = buscar(id);

        pacientes.findByCedula(datos.cedula())
            .ifPresent(existente -> {
                if (!existente.getId().equals(id)) {
                    throw new ConflictoException(
                        "La cédula ya pertenece a otro paciente");
                }
            });

        asignarDatos(p, datos);

        return convertir(pacientes.save(p));
    }

    private void asignarDatos(
            Paciente p, PacienteRequest datos) {

        p.setCedula(datos.cedula());
        p.setNombres(datos.nombres().trim());
        p.setApellidos(datos.apellidos().trim());
        p.setFechaNacimiento(datos.fechaNacimiento());
        p.setTelefono(datos.telefono());
        p.setDireccion(datos.direccion());
    }

    @Transactional
    public void eliminar(Long id) {

        Paciente p = buscar(id);

        if (actividades.existsByPacienteId(id)) {
            throw new ConflictoException(
                "No se puede eliminar al paciente porque "
                + "tiene actividades registradas. "
                + "Se debe conservar su historial.");
        }

        pacientes.delete(p);
    }
}
