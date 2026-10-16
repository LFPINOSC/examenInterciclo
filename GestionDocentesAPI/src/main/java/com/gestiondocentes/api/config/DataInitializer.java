package com.gestiondocentes.api.config;

import com.gestiondocentes.api.entity.*;
import com.gestiondocentes.api.repository.*;
import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {
  private final UsuarioRepository usuarios;
  private final DocenteRepository docentes;
  private final AsignaturaRepository asignaturas;
  private final CarreraRepository carreras;
  private final PeriodoRepository periodos;
  private final AsignacionRepository asignaciones;
  private final PasswordEncoder encoder;

  @Value("${app.admin.nombre}")
  String adminNombre;

  @Value("${app.admin.correo}")
  String adminCorreo;

  @Value("${app.admin.password}")
  String adminPassword;

  public DataInitializer(
      UsuarioRepository u,
      DocenteRepository d,
      AsignaturaRepository a,
      CarreraRepository c,
      PeriodoRepository p,
      AsignacionRepository x,
      PasswordEncoder e) {
    usuarios = u;
    docentes = d;
    asignaturas = a;
    carreras = c;
    periodos = p;
    asignaciones = x;
    encoder = e;
  }

  @Override
  @Transactional
  public void run(String... args) {
    if (!usuarios.existsByCorreo(adminCorreo.toLowerCase())) {
      Usuario u = new Usuario();
      u.setNombre(adminNombre);
      u.setCorreo(adminCorreo.toLowerCase());
      u.setPassword(encoder.encode(adminPassword));
      u.setRol(Rol.ADMIN);
      u.setEstado(EstadoUsuario.APROBADO);
      u.setVerificado(true);
      usuarios.save(u);
    }
    if (docentes.count() == 0
        && asignaturas.count() == 0
        && carreras.count() == 0
        && periodos.count() == 0) {
      Carrera c = new Carrera();
      c.setCodigo("ISC");
      c.setNombre("Ingeniería en Sistemas Computacionales");
      c.setDescripcion("Carrera de tecnologías de información y software");
      c.setActiva(true);
      carreras.save(c);
      Asignatura a = new Asignatura();
      a.setCodigo("WEB301");
      a.setNombre("Programación Web");
      a.setCreditos(4);
      a.setHorasSemanales(6);
      a.setActiva(true);
      asignaturas.save(a);
      PeriodoAcademico p = new PeriodoAcademico();
      p.setNombre("2026-2");
      p.setFechaInicio(LocalDate.of(2026, 9, 1));
      p.setFechaFin(LocalDate.of(2027, 1, 31));
      p.setEstado(EstadoPeriodo.ACTIVO);
      periodos.save(p);
      Docente d = new Docente();
      d.setCedula("0102030405");
      d.setNombres("María");
      d.setApellidos("Pérez");
      d.setCorreoInstitucional("maria.perez@universidad.edu.ec");
      d.setTelefono("0991234567");
      d.setTitulo("Magíster en Tecnologías de la Información");
      d.setFechaIngreso(LocalDate.of(2024, 3, 1));
      d.setEstado(EstadoDocente.ACTIVO);
      docentes.save(d);
      AsignacionDocente x = new AsignacionDocente();
      x.setDocente(d);
      x.setAsignatura(a);
      x.setCarrera(c);
      x.setPeriodo(p);
      x.setParalelo("A");
      x.setHorasAsignadas(6);
      asignaciones.save(x);
    }
    System.out.println("GestionDocentes: datos iniciales verificados.");
  }
}
