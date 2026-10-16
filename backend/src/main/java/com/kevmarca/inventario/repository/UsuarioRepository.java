package com.kevmarca.inventario.repository;

import com.kevmarca.inventario.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// 📌 REPOSITORY = acceso a la base. JpaRepository ya trae save, findAll, findById, delete...
// Spring crea el SQL leyendo el nombre del método (findByUsername -> WHERE username = ?)
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsername(String username);
    boolean existsByUsername(String username);
}
