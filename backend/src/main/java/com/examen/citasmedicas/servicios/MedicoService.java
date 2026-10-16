package com.examen.citasmedicas.servicios;

// ==========================================
// IMPORTACIONES
// ==========================================

// Entidad que representa los medicos del sistema.
import com.examen.citasmedicas.entidades.Medico;

// Repositorio para realizar operaciones
// sobre la tabla medicos de PostgreSQL.
import com.examen.citasmedicas.repositorios.MedicoRepository;

// Repositorio para consultar las citas asignadas
// a un medico y evitar eliminaciones incorrectas.
import com.examen.citasmedicas.repositorios.CitaRepository;

// Permite devolver listas de medicos.
import java.util.List;

// Identifica esta clase como un servicio de Spring.
import org.springframework.stereotype.Service;

// Permite ejecutar operaciones dentro de transacciones.
import org.springframework.transaction.annotation.Transactional;

// Permite manejar errores HTTP correctamente.
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * ==========================================
 * SERVICIO DE MEDICOS
 * SISTEMA DE CONTROL DE CITAS MEDICAS
 * ==========================================
 *
 * Esta clase contiene la logica de negocio
 * para administrar los medicos del sistema.
 *
 * OPERACIONES DISPONIBLES:
 *
 * 1. Listar todos los medicos.
 * 2. Buscar un medico por su ID.
 * 3. Registrar un nuevo medico.
 * 4. Actualizar los datos de un medico.
 * 5. Eliminar un medico.
 * 6. Buscar medicos por especialidad.
 *
 * REGLAS DE NEGOCIO:
 *
 * - No se pueden modificar medicos inexistentes.
 * - No se pueden eliminar medicos inexistentes.
 * - No se pueden eliminar medicos que tengan
 *   citas registradas en el sistema.
 *
 * Esta clase utiliza los repositorios
 * para comunicarse con PostgreSQL.
 */
@Service
public class MedicoService {

    // ==========================================
    // DECLARACION DE REPOSITORIOS
    // ==========================================

    /**
     * Permite guardar, consultar, actualizar
     * y eliminar registros de medicos.
     */
    private final MedicoRepository medicoRepository;

    /**
     * Permite verificar las citas medicas
     * relacionadas con un medico.
     */
    private final CitaRepository citaRepository;

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    /**
     * INYECCION DE DEPENDENCIAS
     *
     * Spring Boot proporciona automaticamente
     * los repositorios que necesita este servicio.
     *
     * Esto permite separar la logica de negocio
     * de las consultas a la base de datos.
     *
     * @param medicoRepository repositorio de medicos.
     * @param citaRepository repositorio de citas.
     */
    public MedicoService(
            MedicoRepository medicoRepository,
            CitaRepository citaRepository) {

        this.medicoRepository = medicoRepository;
        this.citaRepository = citaRepository;
    }

    // ==========================================
    // 1. LISTAR TODOS LOS MEDICOS
    // ==========================================

    /**
     * Obtiene todos los medicos registrados.
     *
     * findAll() es un metodo de JpaRepository
     * que consulta todos los registros de la tabla.
     *
     * readOnly = true indica que esta transaccion
     * se utiliza solamente para consultas.
     *
     * @return lista de medicos registrados.
     */
    @Transactional(readOnly = true)
    public List<Medico> listar() {

        return medicoRepository.findAll();
    }

    // ==========================================
    // 2. BUSCAR MEDICO POR ID
    // ==========================================

    /**
     * Busca un medico utilizando su ID.
     *
     * Si el medico existe, devuelve sus datos.
     *
     * Si no existe, genera un error HTTP 404,
     * que significa recurso no encontrado.
     *
     * @param id identificador del medico.
     * @return medico encontrado.
     */
    @Transactional(readOnly = true)
    public Medico buscarPorId(Long id) {

        return medicoRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Medico no encontrado con ID: " + id
                        )
                );
    }

    // ==========================================
    // 3. REGISTRAR NUEVO MEDICO
    // ==========================================

    /**
     * Guarda un nuevo medico en PostgreSQL.
     *
     * PASOS:
     *
     * 1. Recibir los datos del medico.
     * 2. Limpiar el ID para generar uno nuevo.
     * 3. Guardar el medico en PostgreSQL.
     *
     * Los campos obligatorios se validaran
     * con @Valid desde el controlador REST.
     *
     * @param medico datos del nuevo medico.
     * @return medico registrado.
     */
    @Transactional
    public Medico guardar(Medico medico) {

        // Evita utilizar un ID enviado por el cliente.
        // PostgreSQL generara el identificador.
        medico.setId(null);

        // Guarda el medico en la base de datos.
        return medicoRepository.save(medico);
    }

    // ==========================================
    // 4. ACTUALIZAR MEDICO
    // ==========================================

    /**
     * Actualiza los datos de un medico existente.
     *
     * PASOS:
     *
     * 1. Buscar el medico por ID.
     * 2. Comprobar que exista.
     * 3. Modificar sus atributos.
     * 4. Guardar los cambios en PostgreSQL.
     *
     * Si no existe, se devuelve HTTP 404.
     *
     * @param id identificador del medico.
     * @param datos nuevos datos del medico.
     * @return medico actualizado.
     */
    @Transactional
    public Medico actualizar(Long id, Medico datos) {

        // Consultar si el medico existe.
        Medico medico = buscarPorId(id);

        // Actualizar su nombre.
        medico.setNombre(datos.getNombre());

        // Actualizar su apellido.
        medico.setApellido(datos.getApellido());

        // Actualizar su especialidad.
        medico.setEspecialidad(datos.getEspecialidad());

        // Actualizar su telefono.
        medico.setTelefono(datos.getTelefono());

        // Guardar los cambios realizados.
        return medicoRepository.save(medico);
    }

    // ==========================================
    // 5. ELIMINAR MEDICO
    // ==========================================

    /**
     * Elimina un medico de la base de datos.
     *
     * REGLAS:
     *
     * - Si el medico no existe, devuelve HTTP 404.
     * - Si tiene citas registradas, devuelve HTTP 409.
     * - Si no tiene citas, permite eliminarlo.
     *
     * Se evita eliminar un medico con citas
     * para conservar la integridad referencial
     * de la base de datos.
     *
     * @param id identificador del medico.
     */
    @Transactional
    public void eliminar(Long id) {

        // Verificar que el medico exista.
        buscarPorId(id);

        // Consultar las citas asociadas al medico.
        if (!citaRepository.findByMedico_Id(id).isEmpty()) {

            // HTTP 409 indica un conflicto.
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede eliminar el medico porque tiene citas registradas"
            );
        }

        // Eliminar el registro de PostgreSQL.
        medicoRepository.deleteById(id);
    }

    // ==========================================
    // 6. BUSCAR MEDICOS POR ESPECIALIDAD
    // ==========================================

    /**
     * Busca medicos segun su especialidad.
     *
     * Ejemplos:
     *
     * Medicina General
     * Pediatria
     * Cardiologia
     * Dermatologia
     *
     * IgnoreCase permite buscar sin diferenciar
     * entre mayusculas y minusculas.
     *
     * Este metodo utiliza una consulta generada
     * automaticamente por Spring Data JPA.
     *
     * @param especialidad especialidad solicitada.
     * @return lista de medicos encontrados.
     */
    @Transactional(readOnly = true)
    public List<Medico> buscarPorEspecialidad(
            String especialidad) {

        // Consultar medicos por especialidad.
        return medicoRepository.findByEspecialidadIgnoreCase(
                especialidad
        );
    }
}