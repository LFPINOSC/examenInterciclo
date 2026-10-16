package com.examen.citasmedicas.repositorios;

// Importamos la entidad Medico.
import com.examen.citasmedicas.entidades.Medico;

// Permite utilizar las operaciones CRUD de JPA.
import org.springframework.data.jpa.repository.JpaRepository;

// ==========================================
// REPOSITORIO DE MEDICOS
// ==========================================

/**
 * Permite realizar operaciones sobre la tabla
 * medicos almacenada en PostgreSQL.
 *
 * JpaRepository proporciona automaticamente:
 *
 * save()       - Registrar o actualizar medicos.
 * findAll()    - Listar todos los medicos.
 * findById()   - Consultar un medico por ID.
 * deleteById() - Eliminar un medico.
 * existsById() - Verificar que exista un medico.
 *
 * No es necesario escribir consultas SQL
 * para estas operaciones basicas.
 */
public interface MedicoRepository
        extends JpaRepository<Medico, Long> {

    /**
     * Permite buscar medicos por especialidad.
     *
     * Spring Data JPA genera automaticamente
     * la consulta a partir del nombre del metodo.
     */
    java.util.List<Medico> findByEspecialidadIgnoreCase(
            String especialidad
    );
}