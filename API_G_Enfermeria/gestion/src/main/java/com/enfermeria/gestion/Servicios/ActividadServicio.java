
package com.enfermeria.gestion.Servicios;

import com.enfermeria.gestion.DTO.*;
import com.enfermeria.gestion.Entidades.*;
import com.enfermeria.gestion.Excepciones.*;
import com.enfermeria.gestion.Repositorios.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ActividadServicio {

    private final ActividadRepositorio repositorio;
    private final PacienteRepositorio pacientes;
    private final EnfermeroRepositorio enfermeros;
    private final TurnoRepositorio turnos;

    public ActividadServicio(
            ActividadRepositorio repositorio,
            PacienteRepositorio pacientes,
            EnfermeroRepositorio enfermeros,
            TurnoRepositorio turnos) {
        this.repositorio = repositorio;
        this.pacientes = pacientes;
        this.enfermeros = enfermeros;
        this.turnos = turnos;
    }

    private Actividad buscar(Long id) {
        return repositorio.findById(id)
            .orElseThrow(() ->
                new RecursoNoEncontradoException(
                    "No existe una actividad con ID: " + id));
    }

    private ActividadResponse convertir(Actividad a) {
        return new ActividadResponse(
            a.getId(),
            a.getPaciente().getId(),
            a.getPaciente().getNombres() + " "
                + a.getPaciente().getApellidos(),
            a.getEnfermero().getId(),
            a.getEnfermero().getUsuario().getNombre(),
            a.getTurno() == null ? null : a.getTurno().getId(),
            a.getTipo(),
            a.getDescripcion(),
            a.getFechaProgramada(),
            a.getEstado()
        );
    }

    @Transactional(readOnly = true)
    public List<ActividadResponse> listar() {
        return repositorio.findAll().stream()
            .map(this::convertir).toList();
    }

    @Transactional(readOnly = true)
    public ActividadResponse obtener(Long id) {
        return convertir(buscar(id));
    }

    @Transactional(readOnly = true)
    public List<ActividadResponse> porEnfermero(Long id) {
        return repositorio.findByEnfermeroId(id)
            .stream().map(this::convertir).toList();
    }

    @Transactional(readOnly = true)
    public List<ActividadResponse> porPaciente(Long id) {
        return repositorio.findByPacienteId(id)
            .stream().map(this::convertir).toList();
    }

    private void asignar(Actividad a, ActividadRequest datos) {

        Paciente p = pacientes.findById(datos.pacienteId())
            .orElseThrow(() ->
                new RecursoNoEncontradoException(
                    "El paciente seleccionado no existe"));

        if (!Boolean.TRUE.equals(p.getActivo())) {
            throw new ReglaNegocioException(
                "El paciente está inactivo");
        }

        Enfermero e = enfermeros.findById(datos.enfermeroId())
            .orElseThrow(() ->
                new RecursoNoEncontradoException(
                    "El enfermero seleccionado no existe"));

        if (!Boolean.TRUE.equals(e.getActivo())
                || !Boolean.TRUE.equals(e.getUsuario().getActivo())) {
            throw new ReglaNegocioException(
                "No puedes asignar actividades a un enfermero inactivo");
        }

        Turno turno = null;

        if (datos.turnoId() != null) {
            turno = turnos.findById(datos.turnoId())
                .orElseThrow(() ->
                    new RecursoNoEncontradoException(
                        "El turno seleccionado no existe"));

            if (!Boolean.TRUE.equals(turno.getActivo())) {
                throw new ReglaNegocioException(
                    "El turno seleccionado está inactivo");
            }

            if (!turno.getEnfermero().getId().equals(e.getId())) {
                throw new ReglaNegocioException(
                    "El turno no pertenece al enfermero asignado");
            }

            if (datos.fechaProgramada().isBefore(turno.getFechaInicio())
                    || !datos.fechaProgramada().isBefore(
                            turno.getFechaFin())) {
                throw new ReglaNegocioException(
                    "La actividad debe programarse dentro "
                    + "del horario del turno");
            }
        }

        a.setPaciente(p);
        a.setEnfermero(e);
        a.setTurno(turno);
        a.setTipo(datos.tipo());
        a.setDescripcion(datos.descripcion().trim());
        a.setFechaProgramada(datos.fechaProgramada());
    }

    @Transactional
    public ActividadResponse crear(ActividadRequest datos) {
        Actividad a = new Actividad();
        asignar(a, datos);
        a.setEstado(EstadoActividad.PENDIENTE);
        return convertir(repositorio.save(a));
    }

    @Transactional
    public ActividadResponse actualizar(
            Long id, ActividadRequest datos) {

        Actividad a = buscar(id);

        if (a.getEstado() == EstadoActividad.COMPLETADA
                || a.getEstado() == EstadoActividad.CANCELADA) {
            throw new ReglaNegocioException(
                "No se puede modificar una actividad finalizada");
        }

        asignar(a, datos);
        return convertir(repositorio.save(a));
    }

    @Transactional
    public ActividadResponse cambiarEstado(
            Long id, EstadoActividad nuevoEstado) {

        Actividad a = buscar(id);
        EstadoActividad actual = a.getEstado();

        if (actual == EstadoActividad.COMPLETADA
                || actual == EstadoActividad.CANCELADA) {
            throw new ReglaNegocioException(
                "La actividad ya está finalizada y no "
                + "puede cambiar de estado");
        }

        boolean permitido =
            (actual == EstadoActividad.PENDIENTE
                && (nuevoEstado == EstadoActividad.EN_PROCESO
                    || nuevoEstado == EstadoActividad.CANCELADA))
            || (actual == EstadoActividad.EN_PROCESO
                && nuevoEstado == EstadoActividad.CANCELADA);

        if (!permitido) {
            throw new ReglaNegocioException(
                "Transición de estado no permitida: "
                + actual + " -> " + nuevoEstado
                + ". Para completar una actividad se debe "
                + "registrar el resultado de la atención.");
        }

        a.setEstado(nuevoEstado);
        return convertir(repositorio.save(a));
    }

    @Transactional
    public void cancelar(Long id) {
        cambiarEstado(id, EstadoActividad.CANCELADA);
    }
}
