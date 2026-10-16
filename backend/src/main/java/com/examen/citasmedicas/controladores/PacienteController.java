package com.examen.citasmedicas.controladores;

// ==========================================
// IMPORTACIONES
// ==========================================

// Entidad que representa a los pacientes.
import com.examen.citasmedicas.entidades.Paciente;

// Servicio que contiene la logica del CRUD.
import com.examen.citasmedicas.servicios.PacienteService;

// Validacion de datos recibidos en JSON.
import jakarta.validation.Valid;

// Anotaciones para crear endpoints REST.
import org.springframework.web.bind.annotation.*;

// Herramientas para devolver respuestas HTTP.
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

// Permite devolver listas de pacientes.
import java.util.List;

/**
 * ==========================================
 * CONTROLADOR DE PACIENTES
 * SISTEMA DE CONTROL DE CITAS MEDICAS
 * ==========================================
 *
 * Este controlador permite que Angular
 * se comunique con el backend mediante HTTP.
 *
 * OPERACIONES CRUD:
 *
 * GET    /api/pacientes      Listar pacientes.
 * GET    /api/pacientes/{id} Buscar paciente.
 * POST   /api/pacientes      Registrar paciente.
 * PUT    /api/pacientes/{id} Actualizar paciente.
 * DELETE /api/pacientes/{id} Eliminar paciente.
 *
 * SEGURIDAD:
 *
 * Todos estos endpoints estan protegidos
 * mediante Spring Security y JWT.
 *
 * CONTROL DE ERRORES:
 *
 * 400: Datos invalidos.
 * 401: Usuario no autenticado.
 * 403: Usuario sin permisos.
 * 404: Paciente inexistente.
 * 409: Cedula duplicada o paciente con citas.
 *
 * Los errores de negocio se generan en
 * PacienteService y son gestionados por
 * GlobalExceptionHandler.
 */
@RestController
@RequestMapping("/api/pacientes")
public class PacienteController {

    // ==========================================
    // SERVICIO DE PACIENTES
    // ==========================================

    /**
     * Inyectamos el servicio que contiene
     * las operaciones y validaciones.
     */
    private final PacienteService pacienteService;

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    /**
     * Spring Boot entrega automaticamente
     * el servicio mediante el constructor.
     */
    public PacienteController(
            PacienteService pacienteService) {

        this.pacienteService = pacienteService;
    }

    // ==========================================
    // 1. LISTAR TODOS LOS PACIENTES
    // ==========================================

    /**
     * GET /api/pacientes
     *
     * Devuelve todos los pacientes
     * registrados en PostgreSQL.
     *
     * HTTP 200: Consulta correcta.
     *
     * @return lista de pacientes.
     */
    @GetMapping
    public ResponseEntity<List<Paciente>> listar() {

        // Solicitar los pacientes al servicio.
        List<Paciente> pacientes =
                pacienteService.listar();

        // Devolver los resultados en JSON.
        return ResponseEntity.ok(pacientes);
    }

    // ==========================================
    // 2. BUSCAR PACIENTE POR ID
    // ==========================================

    /**
     * GET /api/pacientes/{id}
     *
     * Busca un paciente por su identificador.
     *
     * @PathVariable recibe el ID desde la URL.
     *
     * HTTP 200: Paciente encontrado.
     * HTTP 404: Paciente inexistente.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Paciente> buscarPorId(
            @PathVariable Long id) {

        Paciente paciente =
                pacienteService.buscarPorId(id);

        return ResponseEntity.ok(paciente);
    }

    // ==========================================
    // 3. REGISTRAR NUEVO PACIENTE
    // ==========================================

    /**
     * POST /api/pacientes
     *
     * Recibe los datos del paciente desde Angular.
     *
     * @RequestBody convierte el JSON recibido
     * en un objeto de tipo Paciente.
     *
     * @Valid activa las validaciones definidas
     * en la entidad Paciente.java.
     *
     * HTTP 201: Paciente registrado.
     * HTTP 400: Datos incorrectos.
     * HTTP 409: Cedula duplicada.
     */
    @PostMapping
    public ResponseEntity<Paciente> guardar(
            @Valid @RequestBody Paciente paciente) {

        // Guardar mediante el servicio.
        Paciente nuevo =
                pacienteService.guardar(paciente);

        // HTTP 201 indica que se creo el registro.
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(nuevo);
    }

    // ==========================================
    // 4. ACTUALIZAR PACIENTE
    // ==========================================

    /**
     * PUT /api/pacientes/{id}
     *
     * Actualiza un paciente existente.
     *
     * Recibe:
     * - ID desde la URL.
     * - Datos actualizados mediante JSON.
     *
     * HTTP 200: Actualizacion correcta.
     * HTTP 400: Datos incorrectos.
     * HTTP 404: Paciente inexistente.
     * HTTP 409: Cedula duplicada.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Paciente> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody Paciente datos) {

        Paciente actualizado =
                pacienteService.actualizar(id, datos);

        return ResponseEntity.ok(actualizado);
    }

    // ==========================================
    // 5. ELIMINAR PACIENTE
    // ==========================================

    /**
     * DELETE /api/pacientes/{id}
     *
     * Elimina un paciente mediante su ID.
     *
     * No permite eliminar pacientes
     * que tengan citas medicas registradas.
     *
     * HTTP 204: Eliminacion correcta.
     * HTTP 404: Paciente inexistente.
     * HTTP 409: Paciente relacionado con citas.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {

        // Aplicar las reglas de eliminacion.
        pacienteService.eliminar(id);

        // HTTP 204 significa operacion correcta
        // sin necesidad de devolver un cuerpo.
        return ResponseEntity.noContent().build();
    }
}