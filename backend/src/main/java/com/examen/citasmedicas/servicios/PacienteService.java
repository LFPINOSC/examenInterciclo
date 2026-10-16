package com.examen.citasmedicas.servicios;

// ==========================================
// IMPORTACIONES
// ==========================================

// Entidad que representa a los pacientes.
import com.examen.citasmedicas.entidades.Paciente;

// Repositorios para acceder a PostgreSQL.
import com.examen.citasmedicas.repositorios.PacienteRepository;
import com.examen.citasmedicas.repositorios.CitaRepository;

// Permite trabajar con listas de pacientes.
import java.util.List;

// Identifica la clase como un servicio de Spring.
import org.springframework.stereotype.Service;

// Permite manejar transacciones con la base de datos.
import org.springframework.transaction.annotation.Transactional;

// Permiten devolver errores HTTP apropiados.
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * ==========================================
 * SERVICIO DE PACIENTES
 * SISTEMA DE CONTROL DE CITAS MEDICAS
 * ==========================================
 *
 * Contiene la logica de negocio relacionada
 * con la administracion de pacientes.
 *
 * OPERACIONES:
 *
 * 1. Listar todos los pacientes.
 * 2. Buscar un paciente por ID.
 * 3. Registrar un paciente.
 * 4. Actualizar los datos de un paciente.
 * 5. Eliminar un paciente.
 *
 * VALIDACIONES:
 *
 * - No permite registrar cedulas repetidas.
 * - No permite actualizar con una cedula
 *   perteneciente a otro paciente.
 * - No permite eliminar pacientes que
 *   tengan citas medicas registradas.
 *
 * Esta clase se comunica con PostgreSQL
 * mediante los repositorios de Spring Data JPA.
 */
@Service
public class PacienteService {

    // ==========================================
    // REPOSITORIOS
    // ==========================================

    /**
     * Repositorio encargado de realizar
     * operaciones sobre la tabla pacientes.
     */
    private final PacienteRepository pacienteRepository;

    /**
     * Repositorio utilizado para verificar
     * si el paciente tiene citas registradas.
     */
    private final CitaRepository citaRepository;

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    /**
     * Inyeccion de dependencias por constructor.
     *
     * Spring entrega automaticamente las
     * implementaciones de los repositorios.
     *
     * Esto evita crear los repositorios
     * manualmente con la palabra new.
     */
    public PacienteService(
            PacienteRepository pacienteRepository,
            CitaRepository citaRepository) {

        this.pacienteRepository = pacienteRepository;
        this.citaRepository = citaRepository;
    }

    // ==========================================
    // 1. LISTAR PACIENTES
    // ==========================================

    /**
     * Obtiene todos los pacientes registrados.
     *
     * findAll() consulta la tabla pacientes.
     *
     * @return lista completa de pacientes.
     */
    @Transactional(readOnly = true)
    public List<Paciente> listar() {

        return pacienteRepository.findAll();
    }

    // ==========================================
    // 2. BUSCAR PACIENTE POR ID
    // ==========================================

    /**
     * Busca un paciente mediante su ID.
     *
     * Si existe, devuelve sus datos.
     * Si no existe, genera un error HTTP 404.
     *
     * @param id identificador del paciente.
     * @return paciente encontrado.
     */
    @Transactional(readOnly = true)
    public Paciente buscarPorId(Long id) {

        return pacienteRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Paciente no encontrado con ID: " + id
                        )
                );
    }

    // ==========================================
    // 3. REGISTRAR PACIENTE
    // ==========================================

    /**
     * Registra un nuevo paciente.
     *
     * Primero comprueba que no exista otra
     * persona registrada con la misma cedula.
     *
     * Si ya existe, devuelve un error HTTP 409.
     *
     * Si los datos son correctos, el repositorio
     * guarda el paciente en PostgreSQL.
     *
     * Las validaciones de campos obligatorios
     * se aplicaran mediante @Valid en el controlador.
     *
     * @param paciente datos del nuevo paciente.
     * @return paciente registrado.
     */
    @Transactional
    public Paciente guardar(Paciente paciente) {

        // Comprobar si la cedula ya esta registrada.
        if (paciente.getCedula() != null &&
                pacienteRepository.existsByCedula(
                        paciente.getCedula())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe un paciente con esa cedula"
            );
        }

        // Impedir que el cliente asigne un ID manual.
        paciente.setId(null);

        // Guardar el nuevo paciente en PostgreSQL.
        return pacienteRepository.save(paciente);
    }

    // ==========================================
    // 4. ACTUALIZAR PACIENTE
    // ==========================================

    /**
     * Actualiza la informacion de un paciente.
     *
     * PASOS:
     *
     * 1. Buscar el paciente por ID.
     * 2. Verificar que la cedula no este repetida.
     * 3. Modificar los atributos.
     * 4. Guardar los cambios en PostgreSQL.
     *
     * Si el paciente no existe devuelve 404.
     * Si la cedula pertenece a otro paciente,
     * devuelve 409.
     *
     * @param id identificador del paciente.
     * @param datos nuevos datos recibidos.
     * @return paciente actualizado.
     */
    @Transactional
    public Paciente actualizar(Long id, Paciente datos) {

        // Buscar el paciente existente.
        Paciente paciente = buscarPorId(id);

        // Comprobar si otra persona utiliza la cedula.
        if (datos.getCedula() != null &&
                pacienteRepository.existsByCedulaAndIdNot(
                        datos.getCedula(), id)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La cedula pertenece a otro paciente"
            );
        }

        // Actualizar los atributos del paciente.
        paciente.setNombre(datos.getNombre());
        paciente.setApellido(datos.getApellido());
        paciente.setCedula(datos.getCedula());
        paciente.setTelefono(datos.getTelefono());
        paciente.setCorreo(datos.getCorreo());

        // Guardar los cambios realizados.
        return pacienteRepository.save(paciente);
    }

    // ==========================================
    // 5. ELIMINAR PACIENTE
    // ==========================================

    /**
     * Elimina un paciente mediante su ID.
     *
     * REGLAS:
     *
     * - Si no existe devuelve HTTP 404.
     * - Si tiene citas registradas devuelve HTTP 409.
     * - Si no tiene citas, permite eliminarlo.
     *
     * Evitamos eliminar pacientes que esten
     * relacionados con citas medicas.
     *
     * @param id identificador del paciente.
     */
    @Transactional
    public void eliminar(Long id) {

        // Comprobar que el paciente existe.
        buscarPorId(id);

        // Consultar si tiene citas medicas registradas.
        if (!citaRepository.findByPaciente_Id(id).isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede eliminar el paciente porque tiene citas registradas"
            );
        }

        // Eliminar el paciente de PostgreSQL.
        pacienteRepository.deleteById(id);
    }
}