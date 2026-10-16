package com.gestiondocentes.api.service;

import com.gestiondocentes.api.dto.AsignaturaRequest;
import com.gestiondocentes.api.entity.Asignatura;
import com.gestiondocentes.api.exception.*;
import com.gestiondocentes.api.repository.AsignaturaRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AsignaturaService {
  private final AsignaturaRepository repo;

  public AsignaturaService(AsignaturaRepository r) {
    repo = r;
  }

  public List<Asignatura> listar() {
    return repo.findAll();
  }

  public Asignatura buscar(Long id) {
    return repo.findById(id)
        .orElseThrow(() -> new RecursoNoEncontradoException("Asignatura no encontrada: " + id));
  }

  @Transactional
  public Asignatura crear(AsignaturaRequest q) {
    if (repo.existsByCodigoIgnoreCase(q.codigo()))
      throw new ConflictoException("El código ya existe");
    Asignatura a = new Asignatura();
    copiar(a, q);
    return repo.save(a);
  }

  @Transactional
  public Asignatura actualizar(Long id, AsignaturaRequest q) {
    Asignatura a = buscar(id);
    if (!a.getCodigo().equalsIgnoreCase(q.codigo()) && repo.existsByCodigoIgnoreCase(q.codigo()))
      throw new ConflictoException("El código ya existe");
    copiar(a, q);
    return a;
  }

  @Transactional
  public void eliminar(Long id) {
    repo.delete(buscar(id));
  }

  private void copiar(Asignatura a, AsignaturaRequest q) {
    a.setCodigo(q.codigo().trim().toUpperCase());
    a.setNombre(q.nombre().trim());
    a.setCreditos(q.creditos());
    a.setHorasSemanales(q.horasSemanales());
    a.setActiva(q.activa());
  }
}
