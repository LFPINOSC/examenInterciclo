package com.examen.citasmedicas.servicios;

// ==========================================
// IMPORTACIONES
// ==========================================

// Entidades utilizadas por el sistema.
import com.examen.citasmedicas.entidades.Cita;
import com.examen.citasmedicas.entidades.Paciente;
import com.examen.citasmedicas.entidades.Medico;

// Repositorios que permiten consultar PostgreSQL.
import com.examen.citasmedicas.repositorios.CitaRepository;
import com.examen.citasmedicas.repositorios.PacienteRepository;
import com.examen.citasmedicas.repositorios.MedicoRepository;

// Clases para trabajar con fechas y horas.
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

// Permite devolver listas de registros.
import java.util.List;
import java.util.Objects;

// Anotacion para identificar los servicios de Spring.
import org.springframework.stereotype.Service;

// Permite controlar las transacciones.
import org.springframework.transaction.annotation.Transactional;

// Clases para manejar errores HTTP.
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * ==========================================
 * SERVICIO DE CITAS MEDICAS
 * ==========================================
 *
 * Esta clase contiene la logica de negocio
 * del sistema de Control de Citas Medicas.
 *
 * FUNCIONALIDADES:
 *
 * 1. Listar citas.
 * 2. Buscar citas por ID.
 * 3. Registrar citas.
 * 4. Actualizar citas.
 * 5. Eliminar citas.
 * 6. Filtrar citas por paciente.
 * 7. Filtrar citas por medico.
 * 8. Filtrar citas por fecha.
 *
 * REGLAS DE NEGOCIO:
 *
 * - Toda cita debe tener un paciente existente.
 * - Toda cita debe tener un medico existente.
 * - No se pueden registrar citas en el pasado.
 * - Un medico no puede tener dos citas activas
 *   en la misma fecha y hora.
 * - Las citas CANCELADAS liberan el horario.
 *
 * Se utiliza Spring Data JPA para realizar
 * las operaciones con PostgreSQL.
 */
@Service
public class CitaService {

    // ==========================================
    // DECLARACION DE REPOSITORIOS
    // ==========================================

    // Administra la tabla citas.
    private final CitaRepository citaRepository;

    // Permite comprobar si existe un paciente.
    private final PacienteRepository pacienteRepository;

    // Permite comprobar si existe un medico.
    private final MedicoRepository medicoRepository;

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    /**
     * Inyeccion de dependencias por constructor.
     *
     * Spring Boot proporciona automaticamente
     * los repositorios necesarios.
     *
     * @param citaRepository repositorio de citas.
     * @param pacienteRepository repositorio de pacientes.
     * @param medicoRepository repositorio de medicos.
     */
    public CitaService(
            CitaRepository citaRepository,
            PacienteRepository pacienteRepository,
            MedicoRepository medicoRepository) {

        this.citaRepository = citaRepository;
        this.pacienteRepository = pacienteRepository;
        this.medicoRepository = medicoRepository;
    }

    // ==========================================
    // 1. LISTAR TODAS LAS CITAS
    // ==========================================

    /**
     * Obtiene todas las citas registradas.
     *
     * findAll() consulta los registros de
     * la tabla citas en PostgreSQL.
     *
     * @return lista de citas medicas.
     */
    @Transactional(readOnly = true)
    public List<Cita> listar() {

        return citaRepository.findAll();
    }

    // ==========================================
    // 2. BUSCAR CITA POR ID
    // ==========================================

    /**
     * Busca una cita mediante su identificador.
     *
     * Si no existe, devuelve HTTP 404.
     *
     * @param id identificador de la cita.
     * @return cita encontrada.
     */
    @Transactional(readOnly = true)
    public Cita buscarPorId(Long id) {

        return citaRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Cita no encontrada con ID: " + id
                        )
                );
    }

    // ==========================================
    // 3. VALIDAR FECHA Y HORA
    // ==========================================

    /**
     * Comprueba que la fecha y hora sean validas.
     *
     * No permite registrar citas en el pasado.
     *
     * LocalDateTime combina la fecha y la hora
     * para compararlas con el momento actual.
     *
     * @param fecha fecha de la cita.
     * @param hora hora de la cita.
     */
    private void validarFechaHora(
            LocalDate fecha,
            LocalTime hora) {

        // Verificar que los datos sean obligatorios.
        if (fecha == null || hora == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fecha y la hora son obligatorias"
            );
        }

        // Combinar fecha y hora.
        LocalDateTime fechaCita =
                LocalDateTime.of(fecha, hora);

        // Obtener la fecha y hora actual del servidor.
        LocalDateTime ahora = LocalDateTime.now();

        // Impedir citas en el pasado.
        if (!fechaCita.isAfter(ahora)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La cita debe programarse para una fecha y hora futura"
            );
        }
    }

    // ==========================================
    // 4. VALIDAR INFORMACION DE CITA
    // ==========================================

    /**
     * Comprueba los campos principales.
     *
     * Evita guardar citas sin motivo o
     * sin informacion basica.
     */
    private void validarDatos(Cita cita) {

        if (cita == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Los datos de la cita son obligatorios"
            );
        }

        if (cita.getMotivo() == null ||
                cita.getMotivo().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El motivo de la cita es obligatorio"
            );
        }

        // Controlar el limite definido en la entidad.
        if (cita.getMotivo().length() > 255) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El motivo no puede superar 255 caracteres"
            );
        }
    }

    // ==========================================
    // 5. VALIDAR ESTADO
    // ==========================================

    /**
     * Comprueba que el estado recibido sea valido.
     *
     * Estados permitidos:
     * PENDIENTE, CONFIRMADA, CANCELADA, ATENDIDA.
     */
    private void validarEstado(String estado) {

        if (estado == null ||
                !(estado.equals("PENDIENTE") ||
                  estado.equals("CONFIRMADA") ||
                  estado.equals("CANCELADA") ||
                  estado.equals("ATENDIDA"))) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Estado de cita no valido"
            );
        }
    }

    // ==========================================
    // 6. BUSCAR PACIENTE Y MEDICO
    // ==========================================

    /**
     * Comprueba que el paciente exista.
     *
     * Si no existe, devuelve HTTP 404.
     */
    private Paciente obtenerPaciente(Long pacienteId) {

        if (pacienteId == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe seleccionar un paciente"
            );
        }

        return pacienteRepository.findById(pacienteId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Paciente no encontrado"
                        )
                );
    }

    /**
     * Comprueba que el medico exista.
     *
     * Si no existe, devuelve HTTP 404.
     */
    private Medico obtenerMedico(Long medicoId) {

        if (medicoId == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe seleccionar un medico"
            );
        }

        return medicoRepository.findById(medicoId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Medico no encontrado"
                        )
                );
    }

    // ==========================================
    // 7. REGISTRAR CITA
    // ==========================================

    /**
     * Registra una nueva cita medica.
     *
     * PASOS:
     *
     * 1. Validar los datos recibidos.
     * 2. Verificar la fecha y hora.
     * 3. Buscar el paciente.
     * 4. Buscar el medico.
     * 5. Comprobar disponibilidad.
     * 6. Guardar la cita en PostgreSQL.
     *
     * @param datos informacion de la cita.
     * @param pacienteId ID del paciente.
     * @param medicoId ID del medico.
     * @return cita registrada.
     */
    @Transactional
    public Cita guardar(
            Cita datos,
            Long pacienteId,
            Long medicoId) {

        // Validar la informacion recibida.
        validarDatos(datos);

        // Comprobar que la cita sea futura.
        validarFechaHora(
                datos.getFecha(),
                datos.getHora()
        );

        // Obtener las entidades relacionadas.
        Paciente paciente = obtenerPaciente(pacienteId);
        Medico medico = obtenerMedico(medicoId);

        // Comprobar que el medico este disponible.
        boolean ocupado =
                citaRepository
                .existsByMedico_IdAndFechaAndHoraAndEstadoNot(
                        medicoId,
                        datos.getFecha(),
                        datos.getHora(),
                        "CANCELADA"
                );

        // Evitar dos citas activas a la misma hora.
        if (ocupado) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El medico ya tiene una cita en ese horario"
            );
        }

        // Crear una nueva entidad.
        Cita cita = new Cita();

        // Asignar los datos de la cita.
        cita.setFecha(datos.getFecha());
        cita.setHora(datos.getHora());
        cita.setMotivo(datos.getMotivo().trim());

        // Las citas nuevas comienzan como PENDIENTE.
        cita.setEstado("PENDIENTE");

        // Asignar las relaciones con claves foraneas.
        cita.setPaciente(paciente);
        cita.setMedico(medico);

        // Guardar el registro en PostgreSQL.
        return citaRepository.save(cita);
    }

    // ==========================================
    // 8. ACTUALIZAR CITA
    // ==========================================

    /**
     * Actualiza una cita medica existente.
     *
     * Permite modificar:
     *
     * - Fecha.
     * - Hora.
     * - Motivo.
     * - Estado.
     * - Paciente.
     * - Medico.
     *
     * Si se cambia el horario, comprueba
     * nuevamente la disponibilidad.
     *
     * @param id identificador de la cita.
     * @param datos informacion actualizada.
     * @param pacienteId paciente seleccionado.
     * @param medicoId medico seleccionado.
     * @return cita actualizada.
     */
    @Transactional
    public Cita actualizar(
            Long id,
            Cita datos,
            Long pacienteId,
            Long medicoId) {

        // Buscar la cita existente.
        Cita cita = buscarPorId(id);

        // Validar los nuevos datos.
        validarDatos(datos);
        validarEstado(datos.getEstado());

        // Comprobar las entidades relacionadas.
        Paciente paciente = obtenerPaciente(pacienteId);
        Medico medico = obtenerMedico(medicoId);

        // Detectar si se modifica la fecha, hora o medico.
        boolean cambioHorario =
                !Objects.equals(cita.getFecha(), datos.getFecha()) ||
                !Objects.equals(cita.getHora(), datos.getHora()) ||
                !Objects.equals(cita.getMedico().getId(), medicoId);

        // Si se reprograma una cita activa,
        // la nueva fecha y hora deben ser futuras.
        if (cambioHorario &&
                !datos.getEstado().equals("CANCELADA")) {

            validarFechaHora(
                    datos.getFecha(),
                    datos.getHora()
            );
        }

        // Las citas no canceladas ocupan horario.
        if (!datos.getEstado().equals("CANCELADA")) {

            // Se excluye el ID de la cita actual.
            boolean ocupado =
                    citaRepository
                    .existsByMedico_IdAndFechaAndHoraAndEstadoNotAndIdNot(
                            medicoId,
                            datos.getFecha(),
                            datos.getHora(),
                            "CANCELADA",
                            id
                    );

            if (ocupado) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "El medico ya tiene otra cita en ese horario"
                );
            }
        }

        // Actualizar los datos de la cita.
        cita.setFecha(datos.getFecha());
        cita.setHora(datos.getHora());
        cita.setMotivo(datos.getMotivo().trim());
        cita.setEstado(datos.getEstado());

        // Actualizar las relaciones.
        cita.setPaciente(paciente);
        cita.setMedico(medico);

        // Guardar los cambios.
        return citaRepository.save(cita);
    }

    // ==========================================
    // 9. ELIMINAR CITA
    // ==========================================

    /**
     * Elimina una cita de PostgreSQL.
     *
     * Primero verifica que exista.
     *
     * Si no existe devuelve HTTP 404.
     *
     * @param id identificador de la cita.
     */
    @Transactional
    public void eliminar(Long id) {

        // Buscar la cita existente.
        Cita cita = buscarPorId(id);

        // Eliminar la cita.
        citaRepository.delete(cita);
    }

    // ==========================================
    // 10. CITAS POR PACIENTE
    // ==========================================

    /**
     * Consulta todas las citas de un paciente.
     *
     * Permite mostrar su historial de citas.
     */
    @Transactional(readOnly = true)
    public List<Cita> listarPorPaciente(Long pacienteId) {

        // Verificar que el paciente exista.
        obtenerPaciente(pacienteId);

        return citaRepository.findByPaciente_Id(pacienteId);
    }

    // ==========================================
    // 11. CITAS POR MEDICO
    // ==========================================

    /**
     * Consulta las citas asignadas a un medico.
     *
     * Permite conocer su agenda de atencion.
     */
    @Transactional(readOnly = true)
    public List<Cita> listarPorMedico(Long medicoId) {

        // Verificar que el medico exista.
        obtenerMedico(medicoId);

        return citaRepository.findByMedico_Id(medicoId);
    }

    // ==========================================
    // 12. CITAS POR FECHA
    // ==========================================

    /**
     * Consulta las citas programadas para
     * una fecha especifica.
     *
     * @param fecha fecha que queremos consultar.
     * @return lista de citas de esa fecha.
     */
    @Transactional(readOnly = true)
    public List<Cita> listarPorFecha(LocalDate fecha) {

        if (fecha == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar una fecha"
            );
        }

        return citaRepository.findByFecha(fecha);
    }
}