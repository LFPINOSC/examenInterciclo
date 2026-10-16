package com.andres.odontologia_api.controlador;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;

import org.springframework.security.core.Authentication;

import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.andres.odontologia_api.dto.UsuarioResumenDTO;
import com.andres.odontologia_api.modelo.Usuario;
import com.andres.odontologia_api.repositorio.UsuarioRepositorio;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

// ==========================================
// CONTROLADOR ADMINISTRATIVO DE USUARIOS
// ==========================================

// El acceso a /api/usuarios/** está protegido
// por SeguridadConfig y requiere rol ADMIN.
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioAdminControlador {

    // Repositorio de usuarios.
    private final UsuarioRepositorio usuarioRepositorio;

    // Inyeccion de dependencias.
    public UsuarioAdminControlador(
            UsuarioRepositorio usuarioRepositorio) {

        this.usuarioRepositorio = usuarioRepositorio;
    }

    // ==========================================
    // DTO PARA CAMBIAR EL ROL
    // ==========================================

    // Acepta unicamente ADMIN o USER.
    public record CambiarRolDTO(

            @NotBlank(message = "El rol es obligatorio")
            @Pattern(
                    regexp = "ADMIN|USER",
                    message = "El rol debe ser ADMIN o USER"
            )
            String rol

    ) {
    }

    // ==========================================
    // GET - LISTAR TODOS LOS USUARIOS
    // ==========================================

    // GET /api/usuarios
    @GetMapping
    @Transactional(readOnly = true)
    public List<UsuarioResumenDTO> listar() {

        return usuarioRepositorio
                .findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(UsuarioResumenDTO::desde)
                .toList();
    }

    // ==========================================
    // GET - BUSCAR USUARIO POR ID
    // ==========================================

    // GET /api/usuarios/{id}
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public UsuarioResumenDTO buscar(@PathVariable Long id) {

        Usuario usuario = obtenerUsuario(id);

        return UsuarioResumenDTO.desde(usuario);
    }

    // ==========================================
    // PATCH - CAMBIAR ROL DEL USUARIO
    // ==========================================

    // PATCH /api/usuarios/{id}/rol
    @PatchMapping("/{id}/rol")
    @Transactional
    public UsuarioResumenDTO cambiarRol(
            @PathVariable Long id,
            @Valid @RequestBody CambiarRolDTO datos,
            Authentication autenticacion) {

        // Buscar usuario.
        Usuario usuario = obtenerUsuario(id);

        // Evitar que el administrador se quite
        // sus propios permisos por accidente.
        if (usuario.getUsername().equals(
                autenticacion.getName())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No puedes modificar tu propio rol"
            );
        }

        // Actualizar el rol.
        usuario.setRol(datos.rol());

        // Guardar en PostgreSQL.
        Usuario guardado = usuarioRepositorio.save(usuario);

        // Devolver datos sin contraseña.
        return UsuarioResumenDTO.desde(guardado);
    }

    // ==========================================
    // PATCH - ACTIVAR USUARIO
    // ==========================================

    // PATCH /api/usuarios/{id}/activar
    @PatchMapping("/{id}/activar")
    @Transactional
    public UsuarioResumenDTO activar(
            @PathVariable Long id) {

        Usuario usuario = obtenerUsuario(id);

        // Habilitar la cuenta.
        usuario.setActivo(true);

        Usuario guardado = usuarioRepositorio.save(usuario);

        return UsuarioResumenDTO.desde(guardado);
    }

    // ==========================================
    // PATCH - DESACTIVAR USUARIO
    // ==========================================

    // PATCH /api/usuarios/{id}/desactivar
    @PatchMapping("/{id}/desactivar")
    @Transactional
    public UsuarioResumenDTO desactivar(
            @PathVariable Long id,
            Authentication autenticacion) {

        Usuario usuario = obtenerUsuario(id);

        // Evitar que el administrador desactive
        // su propia cuenta accidentalmente.
        if (usuario.getUsername().equals(
                autenticacion.getName())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No puedes desactivar tu propia cuenta"
            );
        }

        // Desactivar el usuario.
        usuario.setActivo(false);

        Usuario guardado = usuarioRepositorio.save(usuario);

        return UsuarioResumenDTO.desde(guardado);
    }

    // ==========================================
    // METODO PRIVADO - BUSCAR USUARIO
    // ==========================================

    // Reutilizado para evitar repetir la
    // busqueda y el manejo del error 404.
    private Usuario obtenerUsuario(Long id) {

        return usuarioRepositorio
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuario no encontrado"
                ));
    }
}