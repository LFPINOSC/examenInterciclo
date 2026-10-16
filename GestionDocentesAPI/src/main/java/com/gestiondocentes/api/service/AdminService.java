package com.gestiondocentes.api.service;

import com.gestiondocentes.api.dto.UsuarioResponse;
import com.gestiondocentes.api.entity.*;
import com.gestiondocentes.api.exception.RecursoNoEncontradoException;
import com.gestiondocentes.api.repository.UsuarioRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {
  private final UsuarioRepository repo;

  public AdminService(UsuarioRepository repo) {
    this.repo = repo;
  }

  public List<UsuarioResponse> listar() {
    return repo.findAll().stream().map(this::dto).toList();
  }

  public List<UsuarioResponse> pendientes() {
    return repo.findAll().stream()
        .filter(
            u ->
                u.getRol() == Rol.USER
                    && u.isVerificado()
                    && u.getEstado() == EstadoUsuario.PENDIENTE)
        .map(this::dto)
        .toList();
  }

  @Transactional
  public UsuarioResponse aprobar(Long id) {
    Usuario u = get(id);
    if (u.getRol() == Rol.ADMIN) {
      throw new IllegalArgumentException("La cuenta ADMIN ya esta protegida y aprobada");
    }
    if (!u.isVerificado()) {
      throw new IllegalArgumentException(
          "El usuario debe verificar primero el codigo enviado a su correo");
    }
    if (u.getEstado() == EstadoUsuario.BLOQUEADO) {
      throw new IllegalArgumentException("Primero debe reactivar la cuenta bloqueada");
    }
    u.setEstado(EstadoUsuario.APROBADO);
    return dto(u);
  }

  @Transactional
  public UsuarioResponse bloquear(Long id) {
    Usuario u = get(id);
    if (u.getRol() == Rol.ADMIN) {
      throw new IllegalArgumentException("La cuenta ADMIN principal no puede ser bloqueada");
    }
    u.setEstado(EstadoUsuario.BLOQUEADO);
    return dto(u);
  }

  @Transactional
  public UsuarioResponse activar(Long id) {
    Usuario u = get(id);
    if (u.getRol() == Rol.ADMIN) {
      return dto(u);
    }
    if (!u.isVerificado()) {
      throw new IllegalArgumentException(
          "No se puede activar una cuenta que no ha verificado su correo");
    }
    u.setEstado(EstadoUsuario.APROBADO);
    return dto(u);
  }

  private Usuario get(Long id) {
    return repo.findById(id)
        .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado: " + id));
  }

  private UsuarioResponse dto(Usuario u) {
    return new UsuarioResponse(
        u.getId(),
        u.getNombre(),
        u.getCedula(),
        u.getTelefono(),
        u.getCorreo(),
        u.getRol(),
        u.getEstado(),
        u.isVerificado(),
        u.getFechaRegistro());
  }
}
