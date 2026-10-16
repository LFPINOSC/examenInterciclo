
package com.enfermeria.gestion.Servicios;

import com.enfermeria.gestion.DTO.*;
import com.enfermeria.gestion.Entidades.*;
import com.enfermeria.gestion.Excepciones.*;
import com.enfermeria.gestion.Repositorios.*;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class UsuarioServicio {

    private final UsuarioRepositorio repositorio;
    private final EnfermeroRepositorio enfermeros;
    private final PasswordEncoder passwordEncoder;

    public UsuarioServicio(
            UsuarioRepositorio repositorio,
            EnfermeroRepositorio enfermeros,
            PasswordEncoder passwordEncoder) {
        this.repositorio = repositorio;
        this.enfermeros = enfermeros;
        this.passwordEncoder = passwordEncoder;
    }

    private Usuario buscar(Long id) {
        return repositorio.findById(id)
            .orElseThrow(() ->
                new RecursoNoEncontradoException(
                    "No existe un usuario con ID: " + id));
    }

    private UsuarioResponse convertir(Usuario u) {
        return new UsuarioResponse(
            u.getId(),
            u.getNombre(),
            u.getCorreo(),
            u.getRol(),
            u.getActivo()
        );
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return repositorio.findAll().stream()
                .map(this::convertir).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtener(Long id) {
        return convertir(buscar(id));
    }

    @Transactional
    public UsuarioResponse crear(UsuarioRequest datos) {

        String correo = datos.correo().trim()
                .toLowerCase(Locale.ROOT);

        if (repositorio.existsByCorreoIgnoreCase(correo)) {
            throw new ConflictoException(
                "El correo electrónico ya está registrado: " + correo);
        }

        Usuario u = new Usuario();
        u.setNombre(datos.nombre().trim());
        u.setCorreo(correo);
        u.setPasswordHash(
            passwordEncoder.encode(datos.password()));
        u.setRol(datos.rol());
        u.setActivo(true);

        return convertir(repositorio.save(u));
    }

    @Transactional
    public UsuarioResponse actualizar(
            Long id, UsuarioRequest datos) {

        Usuario u = buscar(id);
        String correo = datos.correo().trim()
                .toLowerCase(Locale.ROOT);

        repositorio.findByCorreoIgnoreCase(correo)
            .ifPresent(existente -> {
                if (!existente.getId().equals(id)) {
                    throw new ConflictoException(
                        "El correo ya pertenece a otro usuario");
                }
            });

        if (enfermeros.existsByUsuarioId(id)
                && datos.rol() != Rol.ENFERMERO) {
            throw new ReglaNegocioException(
                "No puedes cambiar el rol de un usuario "
                + "que tiene un perfil de enfermero asociado");
        }

        u.setNombre(datos.nombre().trim());
        u.setCorreo(correo);
        u.setPasswordHash(
            passwordEncoder.encode(datos.password()));
        u.setRol(datos.rol());

        return convertir(repositorio.save(u));
    }

    @Transactional
    public void desactivar(Long id) {
        Usuario u = buscar(id);
        u.setActivo(false);
        repositorio.save(u);
    }
}
