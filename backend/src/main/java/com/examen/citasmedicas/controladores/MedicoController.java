package com.examen.citasmedicas.controladores;

// ==========================================
// IMPORTACIONES
// ==========================================

// Entidad Medico almacenada en PostgreSQL.
import com.examen.citasmedicas.entidades.Medico;

// Servicio encargado de gestionar los medicos.
import com.examen.citasmedicas.servicios.MedicoService;

// Permite validar los campos obligatorios.
import jakarta.validation.Valid;

// Anotaciones para implementar endpoints REST.
import org.springframework.web.bind.annotation.*;

// Permite devolver respuestas y estados HTTP.
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

// Permite manejar listas de medicos.
import java.util.List;

/**
 * ==========================================
 * CONTROLADOR DE MEDICOS
 * SISTEMA DE CONTROL DE CITAS MEDICAS
 * ==========================================
 *
 * Expone los servicios de administracion
 * de medicos mediante una API REST.
 *
 * FUNCIONALIDADES:
 *
 * 1. Listar medicos registrados.
 * 2. Buscar medico por ID.
 * 3. Registrar medico.
 * 4. Actualizar medico.
 * 5. Eliminar medico.
 * 6. Buscar medicos por especialidad.
 *
 * RUTAS:
 *
 * GET    /api/medicos
 * GET    /api/medicos/{id}
 * GET    /api/medicos/especialidad
 * POST   /api/medicos
 * PUT    /api/medicos/{id}
 * DELETE /api/medicos/{id}
 *
 * SEGURIDAD:
 *
 * El acceso se controla mediante
 * SeguridadConfig y los tokens JWT.
 *
 * CONTROL DE ERRORES:
 *
 * 400: Datos invalidos.
 * 401: Sin autenticacion.
 * 403: Sin permisos.
 * 404: Medico inexistente.
 * 409: Medico relacionado con citas.
 */
@RestController
@RequestMapping("/api/medicos")
public class MedicoController {

    // ==========================================
    // SERVICIO DE MEDICOS
    // ==========================================

    /**
     * Contiene la logica de negocio
     * y las operaciones CRUD.
     */
    private final MedicoService medicoService;

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    /**
     * Inyeccion de dependencias.
     *
     * Spring proporciona automaticamente
     * el servicio necesario.
     */
    public MedicoController(
            MedicoService medicoService) {

        this.medicoService = medicoService;
    }

    // ==========================================
    // 1. LISTAR MEDICOS
    // ==========================================

    /**
     * GET /api/medicos
     *
     * Consulta todos los medicos registrados.
     *
     * HTTP 200: Lista obtenida correctamente.
     */
    @GetMapping
    public ResponseEntity<List<Medico>> listar() {

        List<Medico> medicos =
                medicoService.listar();

        return ResponseEntity.ok(medicos);
    }

    // ==========================================
    // 2. BUSCAR MEDICO POR ESPECIALIDAD
    // ==========================================

    /**
     * GET /api/medicos/especialidad
     *
     * Ejemplo:
     * /api/medicos/especialidad?nombre=Pediatria
     *
     * @RequestParam recibe el parametro
     * enviado en la URL.
     *
     * Permite consultar medicos de
     * una especialidad determinada.
     */
    @GetMapping("/especialidad")
    public ResponseEntity<List<Medico>> buscarEspecialidad(
            @RequestParam("nombre") String especialidad) {

        List<Medico> medicos =
                medicoService.buscarPorEspecialidad(
                        especialidad.trim()
                );

        return ResponseEntity.ok(medicos);
    }

    // ==========================================
    // 3. BUSCAR MEDICO POR ID
    // ==========================================

    /**
     * GET /api/medicos/{id}
     *
     * Busca un medico mediante su ID.
     *
     * HTTP 200: Medico encontrado.
     * HTTP 404: Medico inexistente.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Medico> buscarPorId(
            @PathVariable Long id) {

        Medico medico =
                medicoService.buscarPorId(id);

        return ResponseEntity.ok(medico);
    }

    // ==========================================
    // 4. REGISTRAR NUEVO MEDICO
    // ==========================================

    /**
     * POST /api/medicos
     *
     * Recibe los datos de un medico
     * mediante JSON desde Angular.
     *
     * @Valid comprueba los campos obligatorios.
     *
     * HTTP 201: Medico registrado.
     * HTTP 400: Datos invalidos.
     */
    @PostMapping
    public ResponseEntity<Medico> guardar(
            @Valid @RequestBody Medico medico) {

        Medico nuevo =
                medicoService.guardar(medico);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(nuevo);
    }

    // ==========================================
    // 5. ACTUALIZAR MEDICO
    // ==========================================

    /**
     * PUT /api/medicos/{id}
     *
     * Actualiza los datos de un medico.
     *
     * @PathVariable recibe el identificador.
     * @RequestBody recibe los datos JSON.
     *
     * HTTP 200: Actualizacion correcta.
     * HTTP 400: Datos invalidos.
     * HTTP 404: Medico inexistente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Medico> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody Medico datos) {

        Medico actualizado =
                medicoService.actualizar(id, datos);

        return ResponseEntity.ok(actualizado);
    }

    // ==========================================
    // 6. ELIMINAR MEDICO
    // ==========================================

    /**
     * DELETE /api/medicos/{id}
     *
     * Elimina un medico registrado.
     *
     * REGLAS:
     *
     * - Si el medico no existe devuelve 404.
     * - Si tiene citas registradas devuelve 409.
     * - Si no tiene citas permite eliminarlo.
     *
     * HTTP 204: Eliminacion correcta.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {

        medicoService.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}