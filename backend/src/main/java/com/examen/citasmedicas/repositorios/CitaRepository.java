package com.examen.citasmedicas.repositorios;

// Importamos la entidad Cita.
import com.examen.citasmedicas.entidades.Cita;

// Importacion para operaciones CRUD.
import org.springframework.data.jpa.repository.JpaRepository;

// Tipos para fechas y horas.
import java.time.LocalDate;
import java.time.LocalTime;

// Tipo para devolver listas de citas.
import java.util.List;

// ==========================================
// REPOSITORIO DE CITAS MEDICAS
// ==========================================

/**
 * Administra la tabla citas de PostgreSQL.
 *
 * JpaRepository permite:
 *
 * save()       - Registrar o actualizar citas.
 * findAll()    - Listar todas las citas.
 * findById()   - Consultar una cita por ID.
 * deleteById() - Eliminar citas.
 *
 * Tambien declaramos consultas adicionales
 * para controlar la disponibilidad medica.
 */
public interface CitaRepository
        extends JpaRepository<Cita, Long> {

    /**
     * Obtiene todas las citas de un paciente.
     *
     * paciente.id hace referencia a la clave
     * primaria de la tabla pacientes.
     */
    List<Cita> findByPaciente_Id(Long pacienteId);

    /**
     * Obtiene todas las citas asignadas
     * a un medico determinado.
     */
    List<Cita> findByMedico_Id(Long medicoId);

    /**
     * Busca las citas de una fecha especifica.
     *
     * Ejemplo: consultar las citas del dia.
     */
    List<Cita> findByFecha(LocalDate fecha);

    /**
     * Comprueba si el medico ya tiene una cita
     * en una fecha y hora determinada.
     *
     * Las citas CANCELADAS no ocupan ese horario.
     *
     * Este metodo servira para evitar que un
     * medico tenga dos citas al mismo tiempo.
     */
    boolean existsByMedico_IdAndFechaAndHoraAndEstadoNot(
            Long medicoId,
            LocalDate fecha,
            LocalTime hora,
            String estado
    );

    /**
     * Comprueba conflictos al EDITAR una cita.
     *
     * Excluye la cita actual mediante su ID
     * para no detectar la misma cita como conflicto.
     */
    boolean existsByMedico_IdAndFechaAndHoraAndEstadoNotAndIdNot(
            Long medicoId,
            LocalDate fecha,
            LocalTime hora,
            String estado,
            Long citaId
    );
}