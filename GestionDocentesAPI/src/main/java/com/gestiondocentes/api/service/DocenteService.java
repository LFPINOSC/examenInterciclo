package com.gestiondocentes.api.service;

import com.gestiondocentes.api.dto.DocenteRequest;
import com.gestiondocentes.api.entity.Docente;
import com.gestiondocentes.api.exception.*;
import com.gestiondocentes.api.repository.DocenteRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DocenteService {
  private final DocenteRepository repo;

  public DocenteService(DocenteRepository r) {
    repo = r;
  }

  public List<Docente> listar() {
    return repo.findAll();
  }

  public Docente buscar(Long id) {
    return repo.findById(id)
        .orElseThrow(() -> new RecursoNoEncontradoException("Docente no encontrado: " + id));
  }

  @Transactional
  public Docente crear(DocenteRequest q) {
    validar(q, null);
    Docente d = new Docente();
    copiar(d, q);
    return repo.save(d);
  }

  @Transactional
  public Docente actualizar(Long id, DocenteRequest q) {
    Docente d = buscar(id);
    validar(q, d);
    copiar(d, q);
    return d;
  }

  @Transactional
  public void eliminar(Long id) {
    repo.delete(buscar(id));
  }

  private void validar(DocenteRequest q, Docente actual) {
    if ((actual == null || !actual.getCedula().equalsIgnoreCase(q.cedula()))
        && repo.existsByCedulaIgnoreCase(q.cedula()))
      throw new ConflictoException("La cédula ya está registrada");
    if ((actual == null
            || !actual.getCorreoInstitucional().equalsIgnoreCase(q.correoInstitucional()))
        && repo.existsByCorreoInstitucionalIgnoreCase(q.correoInstitucional()))
      throw new ConflictoException("El correo institucional ya está registrado");
  }

  private void copiar(Docente d, DocenteRequest q) {
    d.setCedula(q.cedula().trim());
    d.setNombres(q.nombres().trim());
    d.setApellidos(q.apellidos().trim());
    d.setCorreoInstitucional(q.correoInstitucional().trim().toLowerCase());
    d.setTelefono(q.telefono().trim());
    d.setTitulo(q.titulo().trim());
    d.setFechaIngreso(q.fechaIngreso());
    d.setEstado(q.estado());
  }
}
