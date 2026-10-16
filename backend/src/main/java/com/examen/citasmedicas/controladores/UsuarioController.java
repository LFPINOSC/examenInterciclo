package com.examen.citasmedicas.controladores;

// ==========================================
// IMPORTACIONES
// ==========================================

// Servicio que contiene la logica para
// registrar, consultar y administrar usuarios.
import com.examen.citasmedicas.servicios.UsuarioService;

// DTO de respuesta que no incluye contraseñas.
import com.examen.citasmedicas.servicios.UsuarioService.UsuarioRespuesta;

// Validaciones de los datos recibidos.
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Anotaciones para crear los endpoints REST.
import org.springframework.web.bind.annotation.*;

// Permiten devolver respuestas y codigos HTTP.
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

// Permite devolver listas de usuarios.
import java.util.List;

/**
 * ==========================================
 * CONTROLADOR REST DE USUARIOS
 * SISTEMA DE CONTROL DE CITAS MEDICAS
 * ==========================================
 *
 * Este controlador administra las cuentas
 * registradas en nuestro sistema.
 *
 * OPERACIONES:
 *
 * 1. Listar usuarios.
 * 2. Consultar usuario por ID.
 * 3. Registrar usuario.
 * 4. Actualizar datos, rol y estado.
 * 5. Cambiar contraseña.
 * 6. Eliminar usuario.
 *
 * SEGURIDAD:
 *
 * Todos los endpoints comienzan con
 * /api/usuarios y estan protegidos
 * para el rol ADMIN en SeguridadConfig.
 *
 * Las contraseñas se protegen mediante
 * BCrypt desde UsuarioService.
 *
 * Nunca devolvemos contraseñas ni hashes
 * en las respuestas del controlador.
 */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    // ==========================================
    // SERVICIO DE USUARIOS
    // ==========================================

    /**
     * Contiene las operaciones CRUD
     * y las validaciones de usuarios.
     */
    private final UsuarioService usuarioService;

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    /**
     * Spring Boot proporciona automaticamente
     * el servicio mediante inyeccion
     * de dependencias por constructor.
     */
    public UsuarioController(
            UsuarioService usuarioService) {

        this.usuarioService = usuarioService;
    }

    // ==========================================
    // DTO: REGISTRAR USUARIO
    // ==========================================

    /**
     * Define los datos necesarios para
     * registrar una nueva cuenta.
     *
     * El usuario nuevo recibira el rol
     * RECEPCIONISTA desde UsuarioService.
     *
     * No permitimos asignar ADMIN
     * directamente durante el registro.
     */
    public record RegistroUsuarioDTO(

        // Nombre de usuario obligatorio.
        @NotBlank(message = "El usuario es obligatorio")
        @Size(
            min = 4,
            max = 50,
            message = "El usuario debe tener entre 4 y 50 caracteres"
        )
        String username,

        // Contraseña obligatoria.
        @NotBlank(message = "La contraseña es obligatoria")
        @Size(
            min = 8,
            message = "La contraseña debe tener minimo 8 caracteres"
        )
        String password

    ) {}

    // ==========================================
    // DTO: ACTUALIZAR USUARIO
    // ==========================================

    /**
     * Permite actualizar:
     *
     * - Nombre de usuario.
     * - Rol.
     * - Estado activo o inactivo.
     *
     * Estos cambios solo pueden realizarlos
     * los usuarios con permisos ADMIN.
     */
    public record ActualizarUsuarioDTO(

        // Nuevo nombre del usuario.
        @NotBlank(message = "El usuario es obligatorio")
        @Size(
            min = 4,
            max = 50,
            message = "El usuario debe tener entre 4 y 50 caracteres"
        )
        String username,

        // Rol permitido en el sistema.
        @NotBlank(message = "El rol es obligatorio")
        @Pattern(
            regexp = "ADMIN|RECEPCIONISTA",
            message = "El rol debe ser ADMIN o RECEPCIONISTA"
        )
        String rol,

        // Indica si la cuenta esta habilitada.
        @NotNull(message = "El estado es obligatorio")
        Boolean activo

    ) {}

    // ==========================================
    // DTO: CAMBIAR CONTRASEÑA
    // ==========================================

    /**
     * Recibe la nueva contraseña.
     *
     * UsuarioService la convertira en
     * un hash BCrypt antes de guardarla.
     */
    public record CambiarPasswordDTO(

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(
            min = 8,
            message = "La contraseña debe tener minimo 8 caracteres"
        )
        String nuevaPassword

    ) {}

    // ==========================================
    // 1. LISTAR USUARIOS
    // ==========================================

    /**
     * GET /api/usuarios
     *
     * Consulta todos los usuarios
     * registrados en PostgreSQL.
     *
     * Devuelve:
     * id, username, rol, activo.
     *
     * No incluye contraseñas.
     *
     * HTTP 200: Consulta correcta.
     * HTTP 403: Usuario sin permisos.
     */
    @GetMapping
    public ResponseEntity<List<UsuarioRespuesta>> listar() {

        List<UsuarioRespuesta> usuarios =
                usuarioService.listar();

        return ResponseEntity.ok(usuarios);
    }

    // ==========================================
    // 2. BUSCAR USUARIO POR ID
    // ==========================================

    /**
     * GET /api/usuarios/{id}
     *
     * Busca una cuenta mediante su ID.
     *
     * HTTP 200: Usuario encontrado.
     * HTTP 404: Usuario inexistente.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioRespuesta> buscarPorId(
            @PathVariable Long id) {

        UsuarioRespuesta usuario =
                usuarioService.buscarPorId(id);

        return ResponseEntity.ok(usuario);
    }

    // ==========================================
    // 3. REGISTRAR USUARIO
    // ==========================================

    /**
     * POST /api/usuarios
     *
     * Registra una cuenta nueva.
     *
     * PASOS:
     *
     * 1. Recibir username y password.
     * 2. Validar los datos mediante @Valid.
     * 3. Verificar nombres duplicados.
     * 4. Proteger la contraseña con BCrypt.
     * 5. Asignar rol RECEPCIONISTA.
     * 6. Guardar en PostgreSQL.
     *
     * HTTP 201: Cuenta creada.
     * HTTP 400: Datos invalidos.
     * HTTP 409: Username duplicado.
     */
    @PostMapping
    public ResponseEntity<UsuarioRespuesta> guardar(
            @Valid @RequestBody RegistroUsuarioDTO datos) {

        // Enviar datos al servicio.
        UsuarioRespuesta nuevo =
                usuarioService.registrar(
                        datos.username(),
                        datos.password()
                );

        // HTTP 201 indica registro correcto.
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(nuevo);
    }

    // ==========================================
    // 4. ACTUALIZAR USUARIO
    // ==========================================

    /**
     * PUT /api/usuarios/{id}
     *
     * Permite modificar los datos
     * administrativos de una cuenta.
     *
     * Incluye:
     *
     * - Username.
     * - Rol.
     * - Estado activo.
     *
     * Solo ADMIN puede ejecutar esta operacion.
     *
     * HTTP 200: Actualizacion correcta.
     * HTTP 400: Datos incorrectos.
     * HTTP 404: Usuario inexistente.
     * HTTP 409: Username duplicado.
     */
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioRespuesta> actualizar(

            @PathVariable Long id,

            @Valid @RequestBody ActualizarUsuarioDTO datos) {

        // Aplicar las validaciones del servicio.
        UsuarioRespuesta actualizado =
                usuarioService.actualizar(
                        id,
                        datos.username(),
                        datos.rol(),
                        datos.activo()
                );

        // Devolver los datos actualizados.
        return ResponseEntity.ok(actualizado);
    }

    // ==========================================
    // 5. CAMBIAR CONTRASEÑA
    // ==========================================

    /**cd frontend
     * PUT /api/usuarios/{id}/password
     *
     * Permite al administrador cambiar
     * la contraseña de una cuenta.
     *
     * El servicio genera un hash BCrypt
     * y actualiza el registro en PostgreSQL.
     *
     * HTTP 204: Contraseña actualizada.
     * HTTP 400: Contraseña invalida.
     * HTTP 404: Usuario inexistente.
     */
    @PutMapping("/{id}/password")
    public ResponseEntity<Void> cambiarPassword(

            @PathVariable Long id,

            @Valid @RequestBody CambiarPasswordDTO datos) {

        // Cambiar contraseña mediante el servicio.
        usuarioService.cambiarPassword(
                id,
                datos.nuevaPassword()
        );

        // No devolver informacion sensible.
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // 6. ELIMINAR USUARIO
    // ==========================================

    /**
     * DELETE /api/usuarios/{id}
     *
     * Elimina una cuenta registrada.
     *
     * Solo un administrador autenticado
     * puede ejecutar esta operacion.
     *
     * HTTP 204: Usuario eliminado.
     * HTTP 404: Usuario inexistente.
     * HTTP 403: Sin permisos.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {

        // Verificar existencia y eliminar.
        usuarioService.eliminar(id);

        // Devolver HTTP 204 sin contenido.
        return ResponseEntity.noContent().build();
    }
}