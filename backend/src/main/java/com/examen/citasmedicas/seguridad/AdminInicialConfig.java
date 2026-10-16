package com.examen.citasmedicas.seguridad;

// ==========================================
// IMPORTACIONES
// ==========================================

// Entidad que representa a los usuarios.
import com.examen.citasmedicas.entidades.Usuario;

// Repositorio para consultar y guardar usuarios.
import com.examen.citasmedicas.repositorios.UsuarioRepository;

// Permite ejecutar codigo al iniciar Spring Boot.
import org.springframework.boot.ApplicationRunner;

// Permite definir configuraciones y componentes.
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// Permite leer la contraseña desde el entorno.
import org.springframework.beans.factory.annotation.Value;

// Codificador de contraseñas configurado con BCrypt.
import org.springframework.security.crypto.password.PasswordEncoder;

// Permite registrar mensajes en la consola.
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * ==========================================
 * CONFIGURACION DEL ADMINISTRADOR INICIAL
 * SISTEMA DE CONTROL DE CITAS MEDICAS
 * ==========================================
 *
 * Esta clase crea automaticamente una cuenta
 * de administrador cuando inicia el backend.
 *
 * FUNCIONAMIENTO:
 *
 * 1. Comprueba si existe el usuario "admin".
 * 2. Si existe, no crea otra cuenta.
 * 3. Si no existe, solicita que la contraseña
 *    inicial este configurada en el entorno.
 * 4. Protege la contraseña mediante BCrypt.
 * 5. Asigna el rol ADMIN.
 * 6. Guarda el usuario en PostgreSQL.
 *
 * La contraseña nunca se escribe directamente
 * en el codigo ni se muestra en los logs.
 */
@Configuration
public class AdminInicialConfig {

    // Permite mostrar mensajes informativos.
    private static final Logger log =
            LoggerFactory.getLogger(AdminInicialConfig.class);

    // Nombre de usuario del administrador.
    private static final String ADMIN_USERNAME = "admin";

    // ==========================================
    // CREAR ADMINISTRADOR INICIAL
    // ==========================================

    /**
     * @Bean registra el componente en Spring.
     *
     * ApplicationRunner ejecuta su codigo
     * despues de iniciar el contexto de Spring.
     *
     * @param usuarioRepository acceso a PostgreSQL.
     * @param passwordEncoder codificador BCrypt.
     * @param adminPassword contraseña del entorno.
     *
     * @return proceso de inicializacion.
     */
    @Bean
    public ApplicationRunner crearAdministradorInicial(

            UsuarioRepository usuarioRepository,

            PasswordEncoder passwordEncoder,

            @Value("${APP_ADMIN_PASSWORD:}")
            String adminPassword) {

        return args -> {

            // ======================================
            // 1. COMPROBAR SI YA EXISTE EL ADMIN
            // ======================================

            // Evita registrar dos cuentas con
            // el mismo nombre de usuario.
            if (usuarioRepository.existsByUsername(
                    ADMIN_USERNAME)) {

                log.info(
                    "El usuario admin ya existe. "
                    + "No se creara una cuenta duplicada."
                );

                return;
            }

            // ======================================
            // 2. VALIDAR CONTRASEÑA INICIAL
            // ======================================

            // La contraseña debe configurarse
            // desde una variable de entorno.
            if (adminPassword == null ||
                    adminPassword.length() < 8) {

                log.warn(
                    "No se creo el administrador: "
                    + "configure APP_ADMIN_PASSWORD "
                    + "con al menos 8 caracteres."
                );

                return;
            }

            // ======================================
            // 3. CREAR USUARIO ADMINISTRADOR
            // ======================================

            // Crear una instancia de la entidad.
            Usuario administrador = new Usuario();

            // Asignar nombre de usuario.
            administrador.setUsername(ADMIN_USERNAME);

            // Proteger la contraseña con BCrypt.
            administrador.setPassword(
                    passwordEncoder.encode(adminPassword)
            );

            // Asignar permisos de administrador.
            administrador.setRol("ADMIN");

            // Habilitar la cuenta.
            administrador.setActivo(true);

            // ======================================
            // 4. GUARDAR EN POSTGRESQL
            // ======================================

            // save() inserta el registro en
            // la tabla usuarios.
            usuarioRepository.save(administrador);

            // ======================================
            // 5. CONFIRMAR CREACION
            // ======================================

            log.info(
                "Administrador inicial creado correctamente."
            );

            log.info(
                "Username del administrador: {}",
                ADMIN_USERNAME
            );
        };
    }
}