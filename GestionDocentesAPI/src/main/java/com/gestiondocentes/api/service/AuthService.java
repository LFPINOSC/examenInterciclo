package com.gestiondocentes.api.service;

import com.gestiondocentes.api.dto.*;
import com.gestiondocentes.api.entity.*;
import com.gestiondocentes.api.exception.*;
import com.gestiondocentes.api.repository.UsuarioRepository;
import com.gestiondocentes.api.security.JwtService;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
  private final UsuarioRepository repo;
  private final PasswordEncoder encoder;
  private final JwtService jwt;
  private final EmailService mail;
  private final SecureRandom random = new SecureRandom();

  public AuthService(
      UsuarioRepository repo, PasswordEncoder encoder, JwtService jwt, EmailService mail) {
    this.repo = repo;
    this.encoder = encoder;
    this.jwt = jwt;
    this.mail = mail;
  }

  @Transactional
  public RegistroResponse registrar(RegistroRequest q) {
    String correo = q.correo().trim().toLowerCase();
    String cedula = q.cedula().trim();
    if (repo.existsByCorreo(correo)) throw new ConflictoException("El correo ya esta registrado");
    if (repo.existsByCedula(cedula)) throw new ConflictoException("La cedula ya esta registrada");
    Usuario u = new Usuario();
    u.setNombre(q.nombre().trim());
    u.setCedula(cedula);
    u.setTelefono(q.telefono().trim());
    u.setCorreo(correo);
    u.setPassword(encoder.encode(q.password()));
    u.setRol(Rol.USER);
    u.setEstado(EstadoUsuario.PENDIENTE);
    u.setVerificado(false);
    generarCodigo(u);
    repo.save(u);
    mail.enviarCodigoVerificacion(correo, u.getNombre(), u.getCodigoVerificacion());
    return new RegistroResponse(
        "Registro correcto. Revise su correo e ingrese el codigo de verificacion.");
  }

  @Transactional
  public String verificar(VerificacionRequest q) {
    Usuario u =
        repo.findByCorreo(q.correo().trim().toLowerCase())
            .orElseThrow(
                () -> new RecursoNoEncontradoException("No existe un usuario con ese correo"));
    if (u.isVerificado()) {
      if (u.getEstado() == EstadoUsuario.APROBADO) {
        return "La cuenta ya esta verificada y aprobada. Puede iniciar sesion.";
      }
      return "El correo ya esta verificado. Su cuenta esta pendiente de aprobacion del administrador.";
    }
    if (u.getCodigoVerificacion() == null || !u.getCodigoVerificacion().equals(q.codigo().trim())) {
      throw new IllegalArgumentException("El codigo de verificacion es incorrecto");
    }
    if (u.getCodigoExpiraEn() == null || u.getCodigoExpiraEn().isBefore(LocalDateTime.now())) {
      throw new IllegalArgumentException("El codigo ha caducado. Solicite uno nuevo");
    }
    u.setVerificado(true);
    u.setEstado(EstadoUsuario.PENDIENTE);
    u.setCodigoVerificacion(null);
    u.setCodigoExpiraEn(null);
    return "Correo verificado correctamente. Ahora el administrador debe aprobar su cuenta.";
  }

  @Transactional
  public String reenviar(ReenviarCodigoRequest q) {
    Usuario u =
        repo.findByCorreo(q.correo().trim().toLowerCase())
            .orElseThrow(
                () -> new RecursoNoEncontradoException("No existe un usuario con ese correo"));
    if (u.isVerificado()) return "La cuenta ya fue verificada";
    if (u.getEstado() == EstadoUsuario.BLOQUEADO) {
      throw new CuentaNoDisponibleException("La cuenta esta bloqueada");
    }
    generarCodigo(u);
    mail.enviarCodigoVerificacion(u.getCorreo(), u.getNombre(), u.getCodigoVerificacion());
    return "Se envio un nuevo codigo";
  }

  public AuthResponse login(LoginRequest q) {
    Usuario u =
        repo.findByCorreo(q.correo().trim().toLowerCase())
            .orElseThrow(() -> new AutenticacionException("Correo o contrasena incorrectos"));
    if (!encoder.matches(q.password(), u.getPassword())) {
      throw new AutenticacionException("Correo o contrasena incorrectos");
    }
    if (!u.isVerificado()) {
      throw new CuentaNoDisponibleException("Debe verificar su correo con el codigo enviado");
    }
    if (u.getEstado() == EstadoUsuario.PENDIENTE) {
      throw new CuentaNoDisponibleException(
          "Su correo ya fue verificado. La cuenta esta pendiente de aprobacion del administrador");
    }
    if (u.getEstado() == EstadoUsuario.BLOQUEADO) {
      throw new CuentaNoDisponibleException(
          "Su cuenta se encuentra bloqueada por el administrador");
    }
    if (u.getEstado() != EstadoUsuario.APROBADO) {
      throw new CuentaNoDisponibleException("La cuenta no esta disponible");
    }
    return new AuthResponse(
        jwt.generarToken(u.getCorreo(), u.getRol().name()),
        u.getRol().name(),
        u.getId(),
        u.getNombre(),
        u.getCorreo());
  }

  private void generarCodigo(Usuario u) {
    u.setCodigoVerificacion(String.format("%06d", random.nextInt(1_000_000)));
    u.setCodigoExpiraEn(LocalDateTime.now().plusMinutes(15));
  }
}
