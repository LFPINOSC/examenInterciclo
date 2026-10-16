package com.andres.odontologia_api.repositorio;

import com.andres.odontologia_api.modelo.Odontologo;
import org.springframework.data.jpa.repository.JpaRepository;

// Repositorio para gestionar los odontologos
public interface OdontologoRepositorio extends JpaRepository<Odontologo, Long> {

    // JpaRepository proporciona automaticamente:
    // save()     - Crear y actualizar
    // findAll()  - Listar todos
    // findById() - Buscar por ID
    // deleteById() - Eliminar por ID
}