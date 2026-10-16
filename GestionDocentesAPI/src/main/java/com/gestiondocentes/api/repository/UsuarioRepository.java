package com.gestiondocentes.api.repository;

import com.gestiondocentes.api.entity.*;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
  Optional<Usuario> findByCorreo(String correo);

  boolean existsByCorreo(String correo);

  boolean existsByCedula(String cedula);

  List<Usuario> findByEstado(EstadoUsuario estado);
}
