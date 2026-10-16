package com.examen.citasmedicas.repositorios;

// Importamos la entidad Paciente que representa
// la tabla pacientes de PostgreSQL.
import com.examen.citasmedicas.entidades.Paciente;

// JpaRepository proporciona las operaciones CRUD.
import org.springframework.data.jpa.repository.JpaRepository;

// ==========================================
// REPOSITORIO DE PACIENTES
// ==========================================

/**
 * Permite acceder a los registros de pacientes
 * almacenados en PostgreSQL.
 *
 * JpaRepository<Paciente, Long> indica:
 *
 * Paciente: entidad que administraremos.
 * Long: tipo de dato de la clave primaria.
 *
 * Spring Data JPA proporciona automaticamente:
 *
 * save()       - Crear o actualizar pacientes.
 * findAll()    - Obtener todos los pacientes.
 * findById()   - Buscar un paciente por ID.
 * deleteById() - Eliminar un paciente por ID.
 * existsById() - Comprobar si existe un ID.
 */
public interface PacienteRepository
        extends JpaRepository<Paciente, Long> {

    /**
     * Comprueba si existe un paciente registrado
     * con una cedula determinada.
     *
     * Se utiliza para evitar cedulas duplicadas.
     */
    boolean existsByCedula(String cedula);

    /**
     * Comprueba si existe otro paciente con la
     * misma cedula, excluyendo el ID actual.
     *
     * Se utiliza al actualizar pacientes.
     */
    boolean existsByCedulaAndIdNot(
            String cedula,
            Long id
    );
}