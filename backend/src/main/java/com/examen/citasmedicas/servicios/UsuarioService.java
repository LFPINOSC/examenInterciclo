package com.examen.citasmedicas.servicios;

// ==========================================
// IMPORTACIONES
// ==========================================

// Entidad que representa los usuarios del sistema.
import com.examen.citasmedicas.entidades.Usuario;

// Repositorio para consultar y modificar usuarios
// almacenados en la base de datos PostgreSQL.
import com.examen.citasmedicas.repositorios.UsuarioRepository;

// Permite manejar listas de usuarios.
import java.util.List;

// Identifica esta clase como un servicio de Spring.
import org.springframework.stereotype.Service;

// Permite controlar transacciones de base de datos.
import org.springframework.transaction.annotation.Transactional;

// Permite utilizar los codigos de error HTTP.
import org.springframework.http.HttpStatus;

// Permite generar errores HTTP personalizados.
import org.springframework.web.server.ResponseStatusException;

// Herramientas de Spring Security para proteger
// las contraseñas mediante el algoritmo BCrypt.
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * ==========================================
 * SERVICIO DE USUARIOS
 * SISTEMA DE CONTROL DE CITAS MEDICAS
 * ==========================================
 *
 * Esta clase contiene la logica de negocio
 * relacionada con los usuarios del sistema.
 *
 * FUNCIONALIDADES:
 *
 * 1. Listar usuarios.
 * 2. Buscar usuarios por ID.
 * 3. Registrar usuarios.
 * 4. Actualizar usuarios.
 * 5. Cambiar contraseñas.
 * 6. Eliminar usuarios.
 * 7. Buscar usuarios para autenticacion.
 *
 * SEGURIDAD:
 *
 * - Las contraseñas se protegen con BCrypt.
 * - No se permiten usernames duplicados.
 * - Los nuevos usuarios reciben el rol
 *   RECEPCIONISTA de forma predeterminada.
 * - Las respuestas no incluyen contraseñas.
 *
 * Los permisos de acceso ADMIN y RECEPCIONISTA
 * se configuraran posteriormente mediante
 * Spring Security y los controladores.
 */
@Service
public class UsuarioService {

    // ==========================================
    // REPOSITORIO DE USUARIOS
    // ==========================================

    /**
     * Repositorio utilizado para realizar
     * operaciones sobre la tabla usuarios.
     */
    private final UsuarioRepository usuarioRepository;

    /**
     * Codificador de contraseñas.
     *
     * BCrypt genera un hash seguro de la
     * contraseña antes de guardarla.
     *
     * Posteriormente configuraremos Spring
     * Security para verificar estos hashes
     * durante el inicio de sesion.
     */
    private final PasswordEncoder passwordEncoder;

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    /**
     * Spring inyecta automaticamente el
     * repositorio de usuarios.
     *
     * Inicializamos BCrypt para proteger
     * las contraseñas de las cuentas.
     */
    public UsuarioService(
            UsuarioRepository usuarioRepository) {

        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // ==========================================
    // DTO DE RESPUESTA
    // ==========================================

    /**
     * Define los datos que podemos devolver
     * al frontend al consultar usuarios.
     *
     * No incluye password para evitar
     * exponer los hashes de las contraseñas.
     *
     * Un record es una forma sencilla de
     * representar datos en Java 17.
     */
    public record UsuarioRespuesta(
            Long id,
            String username,
            String rol,
            boolean activo
    ) {}

    /**
     * Convierte una entidad Usuario en una
     * respuesta segura para el frontend.
     */
    private UsuarioRespuesta convertirRespuesta(
            Usuario usuario) {

        return new UsuarioRespuesta(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getRol(),
                usuario.isActivo()
        );
    }

    // ==========================================
    // VALIDAR NOMBRE DE USUARIO
    // ==========================================

    /**
     * Comprueba que el username sea valido.
     *
     * Debe tener entre 4 y 50 caracteres
     * y no puede estar vacio.
     */
    private String validarUsername(String username) {

        if (username == null ||
                username.trim().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El nombre de usuario es obligatorio"
            );
        }

        String nombreLimpio = username.trim();

        if (nombreLimpio.length() < 4 ||
                nombreLimpio.length() > 50) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El usuario debe tener entre 4 y 50 caracteres"
            );
        }

        return nombreLimpio;
    }

    // ==========================================
    // VALIDAR CONTRASEÑA
    // ==========================================

    /**
     * Comprueba que la contraseña tenga
     * al menos 8 caracteres.
     *
     * No se modifica la contraseña recibida,
     * porque los espacios tambien pueden
     * formar parte de una contraseña.
     */
    private void validarPassword(String password) {

        if (password == null ||
                password.length() < 8) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La contraseña debe tener minimo 8 caracteres"
            );
        }
    }

    // ==========================================
    // 1. LISTAR USUARIOS
    // ==========================================

    /**
     * Consulta todos los usuarios registrados.
     *
     * Devuelve unicamente datos permitidos.
     *
     * No devuelve las contraseñas.
     *
     * @return lista de usuarios.
     */
    @Transactional(readOnly = true)
    public List<UsuarioRespuesta> listar() {

        return usuarioRepository.findAll()
                .stream()
                .map(this::convertirRespuesta)
                .toList();
    }

    // ==========================================
    // 2. BUSCAR USUARIO POR ID
    // ==========================================

    /**
     * Busca internamente un usuario por ID.
     *
     * Si no existe, devuelve HTTP 404.
     *
     * Este metodo devuelve la entidad
     * para utilizarla dentro del servicio.
     */
    private Usuario buscarEntidad(Long id) {

        return usuarioRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Usuario no encontrado con ID: " + id
                        )
                );
    }

    /**
     * Busca un usuario por su identificador.
     *
     * Devuelve los datos sin contraseña.
     *
     * @param id identificador del usuario.
     * @return informacion del usuario.
     */
    @Transactional(readOnly = true)
    public UsuarioRespuesta buscarPorId(Long id) {

        Usuario usuario = buscarEntidad(id);

        return convertirRespuesta(usuario);
    }

    // ==========================================
    // 3. REGISTRAR USUARIO
    // ==========================================

    /**
     * Registra un nuevo usuario en el sistema.
     *
     * PASOS:
     *
     * 1. Validar el nombre de usuario.
     * 2. Validar la contraseña.
     * 3. Comprobar que no exista el username.
     * 4. Proteger la contraseña con BCrypt.
     * 5. Asignar el rol RECEPCIONISTA.
     * 6. Activar la cuenta.
     * 7. Guardar el usuario en PostgreSQL.
     *
     * El cliente no puede elegir el rol ADMIN
     * durante el registro normal.
     *
     * @param username nombre del nuevo usuario.
     * @param password contraseña recibida.
     * @return usuario registrado sin contraseña.
     */
    @Transactional
    public UsuarioRespuesta registrar(
            String username,
            String password) {

        // Validar el nombre de usuario.
        String nombreLimpio = validarUsername(username);

        // Validar la contraseña.
        validarPassword(password);

        // Impedir nombres de usuario repetidos.
        if (usuarioRepository.existsByUsername(
                nombreLimpio)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El nombre de usuario ya esta registrado"
            );
        }

        // Crear una nueva entidad.
        Usuario usuario = new Usuario();

        // Asignar el username.
        usuario.setUsername(nombreLimpio);

        // Convertir la contraseña a hash BCrypt.
        usuario.setPassword(
                passwordEncoder.encode(password)
        );

        // Asignar permisos basicos.
        usuario.setRol("RECEPCIONISTA");

        // Activar la cuenta.
        usuario.setActivo(true);

        // Guardar el usuario en PostgreSQL.
        Usuario guardado = usuarioRepository.save(usuario);

        // Devolver los datos sin contraseña.
        return convertirRespuesta(guardado);
    }

    // ==========================================
    // 4. ACTUALIZAR USUARIO
    // ==========================================

    /**
     * Actualiza la informacion de una cuenta.
     *
     * Permite modificar:
     *
     * - Nombre de usuario.
     * - Rol.
     * - Estado activo o inactivo.
     *
     * Esta operacion se reservara para ADMIN
     * al implementar el controlador seguro.
     *
     * @param id identificador del usuario.
     * @param username nuevo nombre.
     * @param rol nuevo rol.
     * @param activo estado de la cuenta.
     * @return usuario actualizado.
     */
    @Transactional
    public UsuarioRespuesta actualizar(
            Long id,
            String username,
            String rol,
            boolean activo) {

        // Buscar la cuenta existente.
        Usuario usuario = buscarEntidad(id);

        // Validar el nuevo username.
        String nombreLimpio = validarUsername(username);

        // Evitar duplicados al cambiar el nombre.
        if (!usuario.getUsername().equals(nombreLimpio)
                && usuarioRepository.existsByUsername(
                        nombreLimpio)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El username pertenece a otro usuario"
            );
        }

        // Validar los roles permitidos.
        if (!"ADMIN".equals(rol) &&
                !"RECEPCIONISTA".equals(rol)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El rol debe ser ADMIN o RECEPCIONISTA"
            );
        }

        // Actualizar los atributos.
        usuario.setUsername(nombreLimpio);
        usuario.setRol(rol);
        usuario.setActivo(activo);

        // Guardar en PostgreSQL.
        Usuario actualizado =
                usuarioRepository.save(usuario);

        return convertirRespuesta(actualizado);
    }

    // ==========================================
    // 5. CAMBIAR CONTRASEÑA
    // ==========================================

    /**
     * Cambia la contraseña de un usuario.
     *
     * Primero valida la nueva contraseña.
     * Despues genera un nuevo hash BCrypt.
     *
     * El controlador debera comprobar
     * que quien solicita el cambio tenga
     * autorizacion para realizarlo.
     *
     * @param id identificador del usuario.
     * @param nuevaPassword contraseña nueva.
     */
    @Transactional
    public void cambiarPassword(
            Long id,
            String nuevaPassword) {

        // Buscar usuario existente.
        Usuario usuario = buscarEntidad(id);

        // Validar la nueva contraseña.
        validarPassword(nuevaPassword);

        // Generar el hash de la nueva contraseña.
        usuario.setPassword(
                passwordEncoder.encode(nuevaPassword)
        );

        // Guardar el cambio en PostgreSQL.
        usuarioRepository.save(usuario);
    }

    // ==========================================
    // 6. ELIMINAR USUARIO
    // ==========================================

    /**
     * Elimina una cuenta de usuario.
     *
     * Esta operacion debera estar protegida
     * y disponible solo para administradores.
     *
     * Si el usuario no existe, devuelve 404.
     *
     * @param id identificador del usuario.
     */
    @Transactional
    public void eliminar(Long id) {

        // Comprobar que el usuario exista.
        Usuario usuario = buscarEntidad(id);

        // Eliminar el registro.
        usuarioRepository.delete(usuario);
    }

    // ==========================================
    // 7. BUSCAR USUARIO PARA LOGIN
    // ==========================================

    /**
     * Busca una cuenta mediante su username.
     *
     * Este metodo sera utilizado internamente
     * por nuestro sistema de autenticacion.
     *
     * Devuelve la entidad porque Spring Security
     * necesitara comprobar el hash de contraseña,
     * el rol y el estado de la cuenta.
     *
     * IMPORTANTE:
     * No devolver directamente este objeto
     * desde un controlador REST.
     *
     * @param username nombre de usuario.
     * @return entidad encontrada.
     */
    @Transactional(readOnly = true)
    public Usuario buscarParaLogin(String username) {

        return usuarioRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Credenciales incorrectas"
                        )
                );
    }
}