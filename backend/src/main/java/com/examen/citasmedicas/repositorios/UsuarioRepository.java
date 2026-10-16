package com.examen.citasmedicas.repositorios;

// Entidad Usuario que representa las cuentas
// registradas en nuestro sistema.
import com.examen.citasmedicas.entidades.Usuario;

// Repositorio CRUD de Spring Data JPA.
import org.springframework.data.jpa.repository.JpaRepository;

// Optional permite manejar resultados que
// pueden existir o no en la base de datos.
import java.util.Optional;

// ==========================================
// REPOSITORIO DE USUARIOS
// ==========================================

/**
 * Permite administrar los usuarios del sistema.
 *
 * Sus principales funciones seran:
 *
 * 1. Guardar cuentas de usuarios.
 * 2. Consultar usuarios registrados.
 * 3. Buscar usuarios para iniciar sesion.
 * 4. Verificar nombres de usuario duplicados.
 *
 * La autenticacion y los permisos se
 * implementaran posteriormente con
 * Spring Security.
 */
public interface UsuarioRepository
        extends JpaRepository<Usuario, Long> {

    /**
     * Busca una cuenta por su nombre de usuario.
     *
     * Optional permite comprobar si se encontro
     * el usuario sin trabajar con valores nulos.
     *
     * Este metodo se usara durante el login.
     */
    Optional<Usuario> findByUsername(String username);

    /**
     * Verifica si un nombre de usuario ya
     * esta registrado en PostgreSQL.
     *
     * Evita duplicar cuentas.
     */
    boolean existsByUsername(String username);
}