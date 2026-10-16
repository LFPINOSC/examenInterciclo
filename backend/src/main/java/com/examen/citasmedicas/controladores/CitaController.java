package com.examen.citasmedicas.controladores;

// ==========================================
// IMPORTACIONES
// ==========================================

// Entidad Cita relacionada con PostgreSQL.
import com.examen.citasmedicas.entidades.Cita;

// DTO que recibe los datos desde Angular.
import com.examen.citasmedicas.dto.CitaDTO;

// Servicio con la logica de las citas medicas.
import com.examen.citasmedicas.servicios.CitaService;

// Permite comprobar los datos recibidos.
import jakarta.validation.Valid;

// Anotaciones para crear los endpoints REST.
import org.springframework.web.bind.annotation.*;

// Respuestas y codigos HTTP.
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

// Permite procesar fechas enviadas en la URL.
import org.springframework.format.annotation.DateTimeFormat;

// Tipos para fechas y listas.
import java.time.LocalDate;
import java.util.List;

/**
 * ==========================================
 * CONTROLADOR REST DE CITAS MEDICAS
 * ==========================================
 *
 * Permite administrar las citas mediante HTTP.
 *
 * OPERACIONES:
 *
 * GET    /api/citas
 * GET    /api/citas/{id}
 * GET    /api/citas/paciente/{pacienteId}
 * GET    /api/citas/medico/{medicoId}
 * GET    /api/citas/fecha/{fecha}
 * POST   /api/citas
 * PUT    /api/citas/{id}
 * DELETE /api/citas/{id}
 *
 * CONTROL DE ERRORES:
 *
 * 400 - Datos o fechas incorrectas.
 * 401 - Usuario sin autenticacion.
 * 403 - Usuario sin permisos.
 * 404 - Cita, paciente o medico inexistente.
 * 409 - Medico ocupado en el horario.
 *
 * Spring Security protege estos endpoints
 * mediante autenticacion y roles.
 */
@RestController
@RequestMapping("/api/citas")
public class CitaController {

    // ==========================================
    // SERVICIO DE CITAS
    // ==========================================

    /**
     * Contiene las reglas de negocio:
     *
     * - Comprobar paciente y medico.
     * - Validar las fechas.
     * - Verificar disponibilidad.
     * - Registrar, editar y eliminar citas.
     */
    private final CitaService citaService;

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    /**
     * Spring Boot inyecta automaticamente
     * el servicio mediante el constructor.
     */
    public CitaController(CitaService citaService) {
        this.citaService = citaService;
    }

    // ==========================================
    // 1. LISTAR CITAS
    // ==========================================

    /**
     * GET /api/citas
     *
     * Devuelve todas las citas registradas
     * en PostgreSQL.
     *
     * HTTP 200: Consulta correcta.
     */
    @GetMapping
    public ResponseEntity<List<Cita>> listar() {

        return ResponseEntity.ok(
                citaService.listar()
        );
    }

    // ==========================================
    // 2. BUSCAR CITA POR ID
    // ==========================================

    /**
     * GET /api/citas/{id}
     *
     * Busca una cita mediante su identificador.
     *
     * HTTP 200: Cita encontrada.
     * HTTP 404: Cita inexistente.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Cita> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                citaService.buscarPorId(id)
        );
    }

    // ==========================================
    // 3. LISTAR CITAS POR PACIENTE
    // ==========================================

    /**
     * GET /api/citas/paciente/{pacienteId}
     *
     * Consulta todas las citas relacionadas
     * con un paciente determinado.
     */
    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<Cita>> porPaciente(
            @PathVariable Long pacienteId) {

        return ResponseEntity.ok(
                citaService.listarPorPaciente(pacienteId)
        );
    }

    // ==========================================
    // 4. LISTAR CITAS POR MEDICO
    // ==========================================

    /**
     * GET /api/citas/medico/{medicoId}
     *
     * Permite consultar la agenda de citas
     * de un medico determinado.
     */
    @GetMapping("/medico/{medicoId}")
    public ResponseEntity<List<Cita>> porMedico(
            @PathVariable Long medicoId) {

        return ResponseEntity.ok(
                citaService.listarPorMedico(medicoId)
        );
    }

    // ==========================================
    // 5. LISTAR CITAS POR FECHA
    // ==========================================

    /**
     * GET /api/citas/fecha/{fecha}
     *
     * Ejemplo:
     * /api/citas/fecha/2026-10-20
     *
     * @DateTimeFormat convierte el texto
     * de la URL en una fecha LocalDate.
     */
    @GetMapping("/fecha/{fecha}")
    public ResponseEntity<List<Cita>> porFecha(

            @PathVariable
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fecha) {

        return ResponseEntity.ok(
                citaService.listarPorFecha(fecha)
        );
    }

    // ==========================================
    // 6. REGISTRAR NUEVA CITA
    // ==========================================

    /**
     * POST /api/citas
     *
     * Recibe los datos mediante CitaDTO.
     *
     * PASOS:
     *
     * 1. Validar los campos recibidos.
     * 2. Convertir el DTO en una entidad Cita.
     * 3. Enviar IDs de paciente y medico.
     * 4. Validar disponibilidad en el servicio.
     * 5. Guardar la cita en PostgreSQL.
     *
     * HTTP 201: Cita creada.
     * HTTP 400: Datos incorrectos.
     * HTTP 404: Paciente o medico inexistente.
     * HTTP 409: Horario ocupado.
     */
    @PostMapping
    public ResponseEntity<Cita> guardar(
            @Valid @RequestBody CitaDTO datos) {

        // Crear objeto Cita con los datos recibidos.
        Cita cita = new Cita();

        cita.setFecha(datos.fecha());
        cita.setHora(datos.hora());
        cita.setMotivo(datos.motivo());

        // Todas las citas nuevas empiezan
        // con el estado PENDIENTE.
        cita.setEstado("PENDIENTE");

        // El servicio comprueba las relaciones,
        // horarios y reglas del sistema.
        Cita nueva = citaService.guardar(
                cita,
                datos.pacienteId(),
                datos.medicoId()
        );

        // HTTP 201 indica registro exitoso.
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(nueva);
    }

    // ==========================================
    // 7. ACTUALIZAR CITA
    // ==========================================

    /**
     * PUT /api/citas/{id}
     *
     * Permite modificar:
     *
     * - Fecha y hora.
     * - Motivo.
     * - Paciente.
     * - Medico.
     * - Estado.
     *
     * Si no se envia el estado, conserva
     * el estado que ya tiene la cita.
     *
     * CitaService comprueba nuevamente
     * la disponibilidad del medico.
     *
     * HTTP 200: Actualizacion correcta.
     * HTTP 404: Cita inexistente.
     * HTTP 409: Conflicto de horario.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Cita> actualizar(

            @PathVariable Long id,

            @Valid @RequestBody CitaDTO datos) {

        // Comprobar que la cita exista.
        Cita actual = citaService.buscarPorId(id);

        // Preparar la informacion actualizada.
        Cita cita = new Cita();

        cita.setFecha(datos.fecha());
        cita.setHora(datos.hora());
        cita.setMotivo(datos.motivo());

        // Conservar estado actual si Angular
        // no envia uno nuevo.
        String estado = datos.estado() != null
                ? datos.estado()
                : actual.getEstado();

        cita.setEstado(estado);

        // Enviar la informacion al servicio.
        Cita actualizada = citaService.actualizar(
                id,
                cita,
                datos.pacienteId(),
                datos.medicoId()
        );

        return ResponseEntity.ok(actualizada);
    }

    // ==========================================
    // 8. ELIMINAR CITA
    // ==========================================

    /**
     * DELETE /api/citas/{id}
     *
     * Elimina una cita por su identificador.
     *
     * HTTP 204: Eliminacion correcta.
     * HTTP 404: Cita inexistente.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {

        citaService.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}