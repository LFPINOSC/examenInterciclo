package com.gestiondocentes.api.service;

import com.gestiondocentes.api.dto.CarreraRequest;
import com.gestiondocentes.api.entity.Carrera;
import com.gestiondocentes.api.exception.*;
import com.gestiondocentes.api.repository.CarreraRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CarreraService {
  private final CarreraRepository repo;

  public CarreraService(CarreraRepository r) {
    repo = r;
  }

  public List<Carrera> listar() {
    return repo.findAll();
  }

  public Carrera buscar(Long id) {
    return repo.findById(id)
        .orElseThrow(() -> new RecursoNoEncontradoException("Carrera no encontrada: " + id));
  }

  @Transactional
  public Carrera crear(CarreraRequest q) {
    validar(q, null);
    Carrera c = new Carrera();
    copiar(c, q);
    return repo.save(c);
  }

  @Transactional
  public Carrera actualizar(Long id, CarreraRequest q) {
    Carrera c = buscar(id);
    validar(q, c);
    copiar(c, q);
    return c;
  }

  @Transactional
  public void eliminar(Long id) {
    repo.delete(buscar(id));
  }

  private void validar(CarreraRequest q, Carrera c) {
    if ((c == null || !c.getCodigo().equalsIgnoreCase(q.codigo()))
        && repo.existsByCodigoIgnoreCase(q.codigo()))
      throw new ConflictoException("El código ya existe");
    if ((c == null || !c.getNombre().equalsIgnoreCase(q.nombre()))
        && repo.existsByNombreIgnoreCase(q.nombre()))
      throw new ConflictoException("La carrera ya existe");
  }

  private void copiar(Carrera c, CarreraRequest q) {
    c.setCodigo(q.codigo().trim().toUpperCase());
    c.setNombre(q.nombre().trim());
    c.setDescripcion(q.descripcion() == null ? null : q.descripcion().trim());
    c.setActiva(q.activa());
  }
}
