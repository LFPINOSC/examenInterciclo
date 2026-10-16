package com.examen.citasmedicas.controladores;

// ==========================================
// IMPORTACIONES
// ==========================================

// Entidad Usuario almacenada en PostgreSQL.
import com.examen.citasmedicas.entidades.Usuario;

// Servicio para buscar usuarios registrados.
import com.examen.citasmedicas.servicios.UsuarioService;

// Validaciones de los datos recibidos.
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

// Anotaciones para crear endpoints REST.
import org.springframework.web.bind.annotation.*;

// Respuestas y codigos HTTP.
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

// Permite comprobar contraseñas BCrypt.
import org.springframework.security.crypto.password.PasswordEncoder;

// Herramientas para generar tokens JWT.
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;

// Manejo de fechas y tiempo de expiracion.
import java.time.Instant;
import java.time.Duration;

/**
 * ==========================================
 * CONTROLADOR DE AUTENTICACION CON JWT
 * SISTEMA DE CONTROL DE CITAS MEDICAS
 * ==========================================
 *
 * Este controlador permite iniciar sesion
 * utilizando las credenciales almacenadas
 * en PostgreSQL.
 *
 * FUNCIONALIDADES:
 *
 * 1. Recibir username y password.
 * 2. Buscar al usuario en PostgreSQL.
 * 3. Comprobar que la cuenta este activa.
 * 4. Validar la contraseña mediante BCrypt.
 * 5. Generar un token JWT firmado con HS256.
 * 6. Incluir el rol dentro del token.
 * 7. Devolver el token al frontend Angular.
 *
 * SEGURIDAD:
 *
 * - No devuelve contraseñas.
 * - No devuelve hashes BCrypt.
 * - No permite ingresar con cuentas inactivas.
 * - Las credenciales incorrectas devuelven 401.
 * - Los tokens tienen una duracion limitada.
 *
 * Angular utilizara el token para acceder
 * a los endpoints protegidos de nuestra API.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // ==========================================
    // SERVICIOS DE AUTENTICACION
    // ==========================================

    /**
     * Servicio que consulta los usuarios
     * almacenados en PostgreSQL.
     */
    private final UsuarioService usuarioService;

    /**
     * Permite comparar las contraseñas
     * con los hashes BCrypt almacenados.
     */
    private final PasswordEncoder passwordEncoder;

    /**
     * Componente que genera y firma los
     * tokens JWT de nuestra aplicacion.
     */
    private final JwtEncoder jwtEncoder;

    /**
     * Duracion de cada token JWT.
     *
     * El token sera valido durante 60 minutos.
     * Despues sera necesario iniciar sesion
     * nuevamente.
     */
    private static final long EXPIRACION_SEGUNDOS = 3600;

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    /**
     * Inyeccion de dependencias por constructor.
     *
     * Spring proporciona automaticamente
     * los servicios y componentes necesarios.
     */
    public AuthController(
            UsuarioService usuarioService,
            PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder) {

        this.usuarioService = usuarioService;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
    }

    // ==========================================
    // DTO: SOLICITUD DE LOGIN
    // ==========================================

    /**
     * Representa los datos enviados desde Angular.
     *
     * Ejemplo JSON:
     *
     * {
     *   "username": "admin",
     *   "password": "clave_del_administrador"
     * }
     *
     * @NotBlank obliga a completar ambos campos.
     */
    public record LoginSolicitud(

            @NotBlank(message = "El usuario es obligatorio")
            String username,

            @NotBlank(message = "La contraseña es obligatoria")
            String password

    ) {}

    // ==========================================
    // DTO: RESPUESTA DEL LOGIN
    // ==========================================

    /**
     * Representa la informacion que recibira
     * Angular cuando el login sea correcto.
     *
     * DATOS:
     *
     * id: identificador del usuario.
     * username: nombre de usuario.
     * rol: ADMIN o RECEPCIONISTA.
     * activo: estado de la cuenta.
     * token: token JWT generado.
     * tipo: tipo de autenticacion Bearer.
     * expiresIn: duracion en segundos.
     * mensaje: resultado de la operacion.
     *
     * No incluye contraseñas ni hashes.
     */
    public record LoginRespuesta(

            Long id,

            String username,

            String rol,

            boolean activo,

            String token,

            String tipo,

            long expiresIn,

            String mensaje

    ) {}

    // ==========================================
    // ENDPOINT: INICIAR SESION
    // ==========================================

    /**
     * POST /api/auth/login
     *
     * Autentica al usuario y genera un JWT.
     *
     * PROCESO:
     *
     * 1. Validar los campos recibidos.
     * 2. Buscar el usuario en PostgreSQL.
     * 3. Verificar que este activo.
     * 4. Comparar su contraseña con BCrypt.
     * 5. Crear los datos del token.
     * 6. Firmar el JWT mediante HS256.
     * 7. Devolver el token al frontend.
     *
     * RESPUESTAS:
     *
     * 200: Inicio de sesion correcto.
     * 400: Campos obligatorios incorrectos.
     * 401: Credenciales invalidas.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginRespuesta> login(
            @Valid @RequestBody LoginSolicitud solicitud) {

        // ======================================
        // 1. BUSCAR USUARIO EN POSTGRESQL
        // ======================================

        // Eliminar espacios del username.
        String username = solicitud.username().trim();

        // Buscar la cuenta registrada.
        Usuario usuario =
                usuarioService.buscarParaLogin(username);

        // ======================================
        // 2. COMPROBAR ESTADO DE LA CUENTA
        // ======================================

        // Impedir el ingreso de usuarios inactivos.
        if (!usuario.isActivo()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Credenciales incorrectas"
            );
        }

        // ======================================
        // 3. COMPROBAR CONTRASEÑA
        // ======================================

        /**
         * BCrypt compara la contraseña ingresada
         * con el hash almacenado en PostgreSQL.
         */
        boolean passwordCorrecta =
                passwordEncoder.matches(
                        solicitud.password(),
                        usuario.getPassword()
                );

        if (!passwordCorrecta) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Credenciales incorrectas"
            );
        }

        // ======================================
        // 4. CONFIGURAR FECHAS DEL JWT
        // ======================================

        // Obtener la fecha y hora actual en UTC.
        Instant ahora = Instant.now();

        // Calcular cuando expirara el token.
        Instant expiracion = ahora.plus(
                Duration.ofSeconds(EXPIRACION_SEGUNDOS)
        );

        // ======================================
        // 5. CONSTRUIR LOS DATOS DEL JWT
        // ======================================

        /**
         * CLAIMS:
         *
         * issuer: sistema que emite el token.
         * subject: username del usuario.
         * issuedAt: fecha de generacion.
         * expiresAt: fecha de expiracion.
         * rol: permisos del usuario.
         * uid: identificador del usuario.
         *
         * No incluimos contraseñas ni hashes.
         */
        JwtClaimsSet claims = JwtClaimsSet.builder()

                // Nombre de nuestra API.
                .issuer("citas-medicas-api")

                // Usuario autenticado.
                .subject(usuario.getUsername())

                // Momento de generacion.
                .issuedAt(ahora)

                // Momento de expiracion.
                .expiresAt(expiracion)

                // Rol almacenado en PostgreSQL.
                .claim("rol", usuario.getRol())

                // Identificador del usuario.
                .claim("uid", usuario.getId())

                .build();

        // ======================================
        // 6. DEFINIR ALGORITMO DE FIRMA
        // ======================================

        /**
         * HS256 permite firmar el token
         * utilizando nuestra clave JWT_SECRET.
         *
         * La firma permite comprobar que el
         * contenido del JWT no fue modificado.
         */
        JwsHeader header = JwsHeader
                .with(MacAlgorithm.HS256)
                .build();

        // ======================================
        // 7. GENERAR TOKEN JWT
        // ======================================

        /**
         * JwtEncoder utiliza los claims,
         * el encabezado HS256 y la clave
         * configurada en SeguridadConfig.
         */
        String token = jwtEncoder.encode(
                JwtEncoderParameters.from(
                        header,
                        claims
                )
        ).getTokenValue();

        // ======================================
        // 8. CONSTRUIR RESPUESTA SEGURA
        // ======================================

        LoginRespuesta respuesta = new LoginRespuesta(

                // Identificador del usuario.
                usuario.getId(),

                // Nombre de usuario.
                usuario.getUsername(),

                // Rol de seguridad.
                usuario.getRol(),

                // Estado de la cuenta.
                usuario.isActivo(),

                // Token JWT firmado.
                token,

                // Tipo de autenticacion.
                "Bearer",

                // Duracion del token.
                EXPIRACION_SEGUNDOS,

                // Mensaje de confirmacion.
                "Inicio de sesion correcto"
        );

        // ======================================
        // 9. DEVOLVER RESPUESTA HTTP 200
        // ======================================

        return ResponseEntity.ok(respuesta);
    }
}