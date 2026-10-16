package com.jordy.ambulancias.repositorios;
import com.jordy.ambulancias.entidades.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface UsuarioRepositorio extends JpaRepository<Usuario,Long> {Optional<Usuario> findByCorreoIgnoreCase(String correo); boolean existsByCorreoIgnoreCase(String correo);}
