package com.examen.citasmedicas.entidades;

// ==========================================
// IMPORTACIONES
// ==========================================

// Anotaciones JPA para administrar la tabla
// usuarios y sus columnas en PostgreSQL.
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

// Validaciones de los atributos.
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// Permite normalizar los nombres de roles.
import java.util.Locale;

/**
 * ==========================================
 * ENTIDAD USUARIO
 * SISTEMA DE CONTROL DE CITAS MEDICAS
 * ==========================================
 *
 * Representa las cuentas que pueden acceder
 * al sistema mediante usuario y contraseña.
 *
 * FUNCIONALIDADES:
 *
 * 1. Almacenar los datos de autenticacion.
 * 2. Identificar a cada usuario mediante un ID.
 * 3. Controlar los permisos utilizando Rol.java.
 * 4. Permitir activar o desactivar cuentas.
 *
 * ROLES DISPONIBLES:
 *
 * ADMIN:
 * Puede administrar todas las funcionalidades.
 *
 * RECEPCIONISTA:
 * Puede gestionar pacientes, medicos y citas.
 *
 * La clase se relaciona con la tabla
 * usuarios de PostgreSQL mediante JPA.
 */
@Entity
@Table(name = "usuarios")
public class Usuario {

    // ==========================================
    // 1. IDENTIFICADOR DEL USUARIO
    // ==========================================

    /**
     * Clave primaria de la tabla usuarios.
     *
     * @Id identifica la clave primaria.
     * @GeneratedValue genera el ID automaticamente.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==========================================
    // 2. NOMBRE DE USUARIO
    // ==========================================

    /**
     * Nombre utilizado para iniciar sesion.
     *
     * @NotBlank impide valores vacios.
     * @Size establece la longitud permitida.
     * unique = true evita usernames repetidos.
     */
    @NotBlank(message = "El usuario es obligatorio")
    @Size(
        min = 4,
        max = 50,
        message = "El usuario debe tener entre 4 y 50 caracteres"
    )
    @Column(
        nullable = false,
        unique = true,
        length = 50
    )
    private String username;

    // ==========================================
    // 3. CONTRASEÑA DEL USUARIO
    // ==========================================

    /**
     * Contraseña de acceso al sistema.
     *
     * Se almacena como hash BCrypt.
     *
     * UsuarioService genera el hash antes
     * de guardar la contraseña en PostgreSQL.
     *
     * Nunca debemos devolver este atributo
     * en las respuestas JSON de nuestra API.
     */
    @NotBlank(message = "La contraseña es obligatoria")
    @Column(
        nullable = false,
        length = 255
    )
    private String password;

    // ==========================================
    // 4. ROL DEL USUARIO
    // ==========================================

    /**
     * Determina los permisos de cada cuenta.
     *
     * Ahora utilizamos el enum Rol.java.
     *
     * @Enumerated(EnumType.STRING):
     * Guarda el nombre del rol en PostgreSQL.
     *
     * Por ejemplo:
     *
     * ADMIN
     * RECEPCIONISTA
     *
     * @NotNull impide guardar un rol nulo.
     *
     * El rol predeterminado es RECEPCIONISTA.
     *
     * Los permisos reales se controlan
     * desde SeguridadConfig.java.
     */
    @NotNull(message = "El rol es obligatorio")
    @Enumerated(EnumType.STRING)
    @Column(
        nullable = false,
        length = 20
    )
    private Rol rol = Rol.RECEPCIONISTA;

    // ==========================================
    // 5. ESTADO DEL USUARIO
    // ==========================================

    /**
     * Indica si el usuario puede ingresar.
     *
     * true: cuenta activa.
     * false: cuenta desactivada.
     *
     * Spring Security comprueba este atributo
     * antes de permitir la autenticacion.
     */
    @Column(nullable = false)
    private boolean activo = true;

    // ==========================================
    // 6. CONSTRUCTOR VACIO
    // ==========================================

    /**
     * Constructor sin parametros.
     *
     * Es necesario para que Hibernate pueda
     * crear objetos al consultar PostgreSQL.
     */
    public Usuario() {
    }

    // ==========================================
    // 7. GETTERS Y SETTERS
    // ==========================================

    /**
     * GETTERS:
     * Permiten consultar los atributos.
     *
     * SETTERS:
     * Permiten modificar los atributos.
     */

    // ==========================================
    // IDENTIFICADOR
    // ==========================================

    /**
     * Obtiene el identificador del usuario.
     */
    public Long getId() {
        return id;
    }

    /**
     * Establece el identificador del usuario.
     */
    public void setId(Long id) {
        this.id = id;
    }

    // ==========================================
    // USERNAME
    // ==========================================

    /**
     * Obtiene el nombre de usuario.
     */
    public String getUsername() {
        return username;
    }

    /**
     * Modifica el nombre de usuario.
     */
    public void setUsername(String username) {
        this.username = username;
    }

    // ==========================================
    // PASSWORD
    // ==========================================

    /**
     * Obtiene el hash de la contraseña.
     *
     * Se utiliza internamente para autenticar.
     * No debe exponerse en controladores REST.
     */
    public String getPassword() {
        return password;
    }

    /**
     * Modifica la contraseña almacenada.
     *
     * Debe recibir un hash generado con BCrypt,
     * no una contraseña en texto plano.
     */
    public void setPassword(String password) {
        this.password = password;
    }

    // ==========================================
    // ROL
    // ==========================================

    /**
     * Obtiene el nombre del rol como String.
     *
     * Internamente el atributo utiliza Rol.java.
     *
     * Conservamos String para mantener
     * compatibilidad con los servicios y
     * configuraciones que ya desarrollamos.
     *
     * Ejemplo:
     * ADMIN
     */
    public String getRol() {

        if (rol == null) {
            return null;
        }

        return rol.name();
    }

    /**
     * Modifica el rol del usuario.
     *
     * Recibe un String y lo convierte
     * a la enumeracion Rol.
     *
     * Ejemplo:
     * setRol("ADMIN");
     *
     * Rol.valueOf convierte el texto
     * al valor correspondiente del enum.
     *
     * Si el valor no pertenece al enum,
     * genera IllegalArgumentException.
     */
    public void setRol(String rol) {

        if (rol == null) {
            this.rol = null;
            return;
        }

        this.rol = Rol.valueOf(
            rol.trim().toUpperCase(Locale.ROOT)
        );
    }

    // ==========================================
    // ESTADO ACTIVO
    // ==========================================

    /**
     * Comprueba si la cuenta esta activa.
     */
    public boolean isActivo() {
        return activo;
    }

    /**
     * Permite activar o desactivar la cuenta.
     */
    public void setActivo(boolean activo) {
        this.activo = activo;
    }
}