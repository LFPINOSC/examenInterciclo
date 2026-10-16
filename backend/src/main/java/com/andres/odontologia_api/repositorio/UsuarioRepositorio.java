package com.andres.odontologia_api.repositorio;

import com.andres.odontologia_api.modelo.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Repositorio para acceder a la tabla usuarios
public interface UsuarioRepositorio extends JpaRepository<Usuario, Long> {

    // Buscar un usuario por su nombre de usuario
    Optional<Usuario> findByUsername(String username);

    // Comprobar si un nombre de usuario ya existe
    boolean existsByUsername(String username);
}