package com.gestiondocentes.api.service;

import com.gestiondocentes.api.dto.*;
import com.gestiondocentes.api.entity.*;
import com.gestiondocentes.api.exception.*;
import com.gestiondocentes.api.repository.*;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AsignacionService {
  private final AsignacionRepository repo;
  private final DocenteRepository docentes;
  private final AsignaturaRepository asignaturas;
  private final CarreraRepository carreras;
  private final PeriodoRepository periodos;

  public AsignacionService(
      AsignacionRepository r,
      DocenteRepository d,
      AsignaturaRepository a,
      CarreraRepository c,
      PeriodoRepository p) {
    repo = r;
    docentes = d;
    asignaturas = a;
    carreras = c;
    periodos = p;
  }

  @Transactional(readOnly = true)
  public List<AsignacionResponse> listar() {
    return repo.findAll().stream().map(this::dto).toList();
  }

  @Transactional(readOnly = true)
  public AsignacionResponse buscar(Long id) {
    return dto(get(id));
  }

  @Transactional
  public AsignacionResponse crear(AsignacionRequest q) {
    validar(q, null);
    AsignacionDocente x = new AsignacionDocente();
    copiar(x, q);
    return dto(repo.save(x));
  }

  @Transactional
  public AsignacionResponse actualizar(Long id, AsignacionRequest q) {
    AsignacionDocente x = get(id);
    validar(q, id);
    copiar(x, q);
    return dto(x);
  }

  @Transactional
  public void eliminar(Long id) {
    repo.delete(get(id));
  }

  private void validar(AsignacionRequest q, Long id) {
    if (repo.duplicada(
        q.docenteId(), q.asignaturaId(), q.carreraId(), q.periodoId(), q.paralelo(), id))
      throw new ConflictoException("Ya existe esta asignación para el mismo paralelo");
  }

  private AsignacionDocente get(Long id) {
    return repo.findById(id)
        .orElseThrow(() -> new RecursoNoEncontradoException("Asignación no encontrada: " + id));
  }

  private void copiar(AsignacionDocente x, AsignacionRequest q) {
    x.setDocente(
        docentes
            .findById(q.docenteId())
            .orElseThrow(() -> new RecursoNoEncontradoException("Docente no encontrado")));
    x.setAsignatura(
        asignaturas
            .findById(q.asignaturaId())
            .orElseThrow(() -> new RecursoNoEncontradoException("Asignatura no encontrada")));
    x.setCarrera(
        carreras
            .findById(q.carreraId())
            .orElseThrow(() -> new RecursoNoEncontradoException("Carrera no encontrada")));
    x.setPeriodo(
        periodos
            .findById(q.periodoId())
            .orElseThrow(() -> new RecursoNoEncontradoException("Período no encontrado")));
    x.setParalelo(q.paralelo().trim().toUpperCase());
    x.setHorasAsignadas(q.horasAsignadas());
  }

  private AsignacionResponse dto(AsignacionDocente x) {
    return new AsignacionResponse(
        x.getId(),
        x.getDocente().getId(),
        x.getDocente().getNombres() + " " + x.getDocente().getApellidos(),
        x.getAsignatura().getId(),
        x.getAsignatura().getNombre(),
        x.getCarrera().getId(),
        x.getCarrera().getNombre(),
        x.getPeriodo().getId(),
        x.getPeriodo().getNombre(),
        x.getParalelo(),
        x.getHorasAsignadas());
  }
}
