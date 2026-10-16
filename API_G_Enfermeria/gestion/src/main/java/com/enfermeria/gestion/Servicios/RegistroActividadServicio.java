
package com.enfermeria.gestion.Servicios;

import com.enfermeria.gestion.DTO.*;
import com.enfermeria.gestion.Entidades.*;
import com.enfermeria.gestion.Excepciones.*;
import com.enfermeria.gestion.Repositorios.*;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RegistroActividadServicio {

    private final RegistroActividadRepositorio repositorio;
    private final ActividadRepositorio actividades;
    private final EnfermeroRepositorio enfermeros;

    public RegistroActividadServicio(
            RegistroActividadRepositorio repositorio,
            ActividadRepositorio actividades,
            EnfermeroRepositorio enfermeros) {
        this.repositorio = repositorio;
        this.actividades = actividades;
        this.enfermeros = enfermeros;
    }

    private RegistroActividadResponse convertir(RegistroActividad r) {
        return new RegistroActividadResponse(
            r.getId(),
            r.getActividad().getId(),
            r.getEnfermero().getId(),
            r.getFechaRegistro(),
            r.getResultado(),
            r.getObservaciones()
        );
    }

    @Transactional(readOnly = true)
    public List<RegistroActividadResponse> porActividad(Long actividadId) {

        if (!actividades.existsById(actividadId)) {
            throw new RecursoNoEncontradoException(
                "No existe la actividad con ID: " + actividadId);
        }

        return repositorio
            .findByActividadIdOrderByFechaRegistroDesc(actividadId)
            .stream().map(this::convertir).toList();
    }

    @Transactional
    public RegistroActividadResponse registrar(
            Long actividadId,
            Long usuarioAutenticadoId,
            RegistroActividadRequest datos) {

        Actividad actividad = actividades.findById(actividadId)
            .orElseThrow(() ->
                new RecursoNoEncontradoException(
                    "La actividad indicada no existe"));

        Enfermero enfermero = enfermeros
            .findByUsuarioId(usuarioAutenticadoId)
            .orElseThrow(() ->
                new AccessDeniedException(
                    "El usuario autenticado no tiene "
                    + "un perfil de enfermero"));

        if (!actividad.getEnfermero().getId()
                .equals(enfermero.getId())) {
            throw new AccessDeniedException(
                "No puedes registrar una actividad "
                + "asignada a otro enfermero");
        }

        if (!Boolean.TRUE.equals(enfermero.getActivo())
                || !Boolean.TRUE.equals(
                    enfermero.getUsuario().getActivo())) {
            throw new ReglaNegocioException(
                "El enfermero está inactivo");
        }

        if (actividad.getEstado() == EstadoActividad.CANCELADA) {
            throw new ReglaNegocioException(
                "No puedes registrar una actividad cancelada");
        }

        if (actividad.getEstado() == EstadoActividad.COMPLETADA) {
            throw new ReglaNegocioException(
                "La actividad ya fue completada");
        }

        RegistroActividad registro = new RegistroActividad();
        registro.setActividad(actividad);
        registro.setEnfermero(enfermero);
        registro.setResultado(datos.resultado().trim());
        registro.setObservaciones(datos.observaciones());

        RegistroActividad guardado = repositorio.saveAndFlush(registro);

        actividad.setEstado(EstadoActividad.COMPLETADA);
        actividades.save(actividad);

        return convertir(guardado);
    }
}
