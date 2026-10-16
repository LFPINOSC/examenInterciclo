package com.universidad.matriculas.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.universidad.matriculas.model.Usuario;

/**
 * Repositorio encargado de realizar operaciones
 * sobre la tabla usuarios.
 */
@Repository
public interface UsuarioRepository
        extends JpaRepository<Usuario, Long> {

    // Buscar usuario por correo para realizar el login
    Optional<Usuario> findByCorreo(String correo);

    // Permite comprobar si un correo ya está registrado
    boolean existsByCorreo(String correo);

}