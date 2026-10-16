package com.gestiondocentes.api.service;

import com.gestiondocentes.api.dto.PeriodoRequest;
import com.gestiondocentes.api.entity.PeriodoAcademico;
import com.gestiondocentes.api.exception.*;
import com.gestiondocentes.api.repository.PeriodoRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PeriodoService {
  private final PeriodoRepository repo;

  public PeriodoService(PeriodoRepository r) {
    repo = r;
  }

  public List<PeriodoAcademico> listar() {
    return repo.findAll();
  }

  public PeriodoAcademico buscar(Long id) {
    return repo.findById(id)
        .orElseThrow(() -> new RecursoNoEncontradoException("Período no encontrado: " + id));
  }

  @Transactional
  public PeriodoAcademico crear(PeriodoRequest q) {
    validar(q, null);
    PeriodoAcademico p = new PeriodoAcademico();
    copiar(p, q);
    return repo.save(p);
  }

  @Transactional
  public PeriodoAcademico actualizar(Long id, PeriodoRequest q) {
    PeriodoAcademico p = buscar(id);
    validar(q, p);
    copiar(p, q);
    return p;
  }

  @Transactional
  public void eliminar(Long id) {
    repo.delete(buscar(id));
  }

  private void validar(PeriodoRequest q, PeriodoAcademico p) {
    if (!q.fechaFin().isAfter(q.fechaInicio()))
      throw new IllegalArgumentException("La fecha fin debe ser posterior a la fecha inicio");
    if ((p == null || !p.getNombre().equalsIgnoreCase(q.nombre()))
        && repo.existsByNombreIgnoreCase(q.nombre()))
      throw new ConflictoException("El período ya existe");
  }

  private void copiar(PeriodoAcademico p, PeriodoRequest q) {
    p.setNombre(q.nombre().trim());
    p.setFechaInicio(q.fechaInicio());
    p.setFechaFin(q.fechaFin());
    p.setEstado(q.estado());
  }
}
