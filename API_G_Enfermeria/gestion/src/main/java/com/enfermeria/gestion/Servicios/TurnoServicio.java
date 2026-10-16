
package com.enfermeria.gestion.Servicios;

import com.enfermeria.gestion.DTO.*;
import com.enfermeria.gestion.Entidades.*;
import com.enfermeria.gestion.Excepciones.*;
import com.enfermeria.gestion.Repositorios.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TurnoServicio {

    private final TurnoRepositorio repositorio;
    private final EnfermeroRepositorio enfermeros;
    private final ActividadRepositorio actividades;

    public TurnoServicio(
            TurnoRepositorio repositorio,
            EnfermeroRepositorio enfermeros,
            ActividadRepositorio actividades) {
        this.repositorio = repositorio;
        this.enfermeros = enfermeros;
        this.actividades = actividades;
    }

    private Turno buscar(Long id) {
        return repositorio.findById(id)
            .orElseThrow(() ->
                new RecursoNoEncontradoException(
                    "No existe un turno con ID: " + id));
    }

    private TurnoResponse convertir(Turno t) {
        return new TurnoResponse(
            t.getId(),
            t.getEnfermero().getId(),
            t.getEnfermero().getUsuario().getNombre(),
            t.getFechaInicio(),
            t.getFechaFin(),
            t.getObservaciones(),
            t.getActivo()
        );
    }

    @Transactional(readOnly = true)
    public List<TurnoResponse> listar() {
        return repositorio.findAll().stream()
            .map(this::convertir).toList();
    }

    @Transactional(readOnly = true)
    public TurnoResponse obtener(Long id) {
        return convertir(buscar(id));
    }

    @Transactional(readOnly = true)
    public List<TurnoResponse> porEnfermero(Long enfermeroId) {
        return repositorio.findByEnfermeroId(enfermeroId)
            .stream().map(this::convertir).toList();
    }

    private Enfermero validarEnfermero(Long id) {
        Enfermero e = enfermeros.findById(id)
            .orElseThrow(() ->
                new RecursoNoEncontradoException(
                    "No existe el enfermero indicado"));

        if (!Boolean.TRUE.equals(e.getActivo())
                || !Boolean.TRUE.equals(e.getUsuario().getActivo())) {
            throw new ReglaNegocioException(
                "No se pueden asignar turnos a un enfermero inactivo");
        }

        return e;
    }

    private void validarFechas(TurnoRequest datos) {
        if (!datos.fechaFin().isAfter(datos.fechaInicio())) {
            throw new ReglaNegocioException(
                "La fecha de fin debe ser posterior al inicio");
        }
    }

    private void validarSolapamiento(
            Long enfermeroId,
            TurnoRequest datos,
            Long turnoExcluido) {

        boolean ocupado = repositorio
            .findByEnfermeroId(enfermeroId)
            .stream()
            .filter(t -> Boolean.TRUE.equals(t.getActivo()))
            .filter(t -> turnoExcluido == null
                    || !t.getId().equals(turnoExcluido))
            .anyMatch(t ->
                t.getFechaInicio().isBefore(datos.fechaFin())
                && t.getFechaFin().isAfter(datos.fechaInicio()));

        if (ocupado) {
            throw new ConflictoException(
                "El enfermero ya tiene un turno que se cruza "
                + "con el horario solicitado");
        }
    }

    @Transactional
    public TurnoResponse crear(TurnoRequest datos) {

        validarFechas(datos);
        Enfermero e = validarEnfermero(datos.enfermeroId());
        validarSolapamiento(e.getId(), datos, null);

        Turno t = new Turno();
        t.setEnfermero(e);
        t.setFechaInicio(datos.fechaInicio());
        t.setFechaFin(datos.fechaFin());
        t.setObservaciones(datos.observaciones());

        return convertir(repositorio.save(t));
    }

    @Transactional
    public TurnoResponse actualizar(
            Long id, TurnoRequest datos) {

        Turno t = buscar(id);

        if (actividades.existsByTurnoId(id)) {
            throw new ReglaNegocioException(
                "No puedes modificar un turno que ya tiene "
                + "actividades asociadas");
        }

        validarFechas(datos);
        Enfermero e = validarEnfermero(datos.enfermeroId());
        validarSolapamiento(e.getId(), datos, id);

        t.setEnfermero(e);
        t.setFechaInicio(datos.fechaInicio());
        t.setFechaFin(datos.fechaFin());
        t.setObservaciones(datos.observaciones());

        return convertir(repositorio.save(t));
    }

    @Transactional
    public void desactivar(Long id) {

        Turno t = buscar(id);

        if (actividades.existsByTurnoId(id)) {
            throw new ConflictoException(
                "No puedes desactivar un turno que tiene "
                + "actividades asociadas");
        }

        t.setActivo(false);
        repositorio.save(t);
    }
}
