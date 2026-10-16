
package com.enfermeria.gestion.Servicios;

import com.enfermeria.gestion.DTO.*;
import com.enfermeria.gestion.Entidades.*;
import com.enfermeria.gestion.Excepciones.*;
import com.enfermeria.gestion.Repositorios.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EnfermeroServicio {

    private final EnfermeroRepositorio repositorio;
    private final UsuarioRepositorio usuarios;

    public EnfermeroServicio(
            EnfermeroRepositorio repositorio,
            UsuarioRepositorio usuarios) {
        this.repositorio = repositorio;
        this.usuarios = usuarios;
    }

    private Enfermero buscar(Long id) {
        return repositorio.findById(id)
            .orElseThrow(() ->
                new RecursoNoEncontradoException(
                    "No existe un enfermero con ID: " + id));
    }

    private EnfermeroResponse convertir(Enfermero e) {
        return new EnfermeroResponse(
            e.getId(),
            e.getUsuario().getId(),
            e.getUsuario().getNombre(),
            e.getUsuario().getCorreo(),
            e.getCedula(),
            e.getNumeroLicencia(),
            e.getTelefono(),
            e.getEspecialidad(),
            e.getActivo()
        );
    }

    @Transactional(readOnly = true)
    public List<EnfermeroResponse> listar() {
        return repositorio.findAll().stream()
            .map(this::convertir).toList();
    }

    @Transactional(readOnly = true)
    public EnfermeroResponse obtener(Long id) {
        return convertir(buscar(id));
    }

    @Transactional
    public EnfermeroResponse crear(EnfermeroRequest datos) {

        Usuario usuario = usuarios.findById(datos.usuarioId())
            .orElseThrow(() ->
                new RecursoNoEncontradoException(
                    "El usuario indicado no existe"));

        if (usuario.getRol() != Rol.ENFERMERO) {
            throw new ReglaNegocioException(
                "El usuario debe tener el rol ENFERMERO");
        }

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new ReglaNegocioException(
                "No puedes asignar un perfil a un usuario inactivo");
        }

        if (repositorio.existsByUsuarioId(datos.usuarioId())) {
            throw new ConflictoException(
                "El usuario ya tiene un perfil de enfermero");
        }

        if (repositorio.existsByCedula(datos.cedula())) {
            throw new ConflictoException(
                "La cédula ya está registrada");
        }

        if (repositorio.existsByNumeroLicencia(
                datos.numeroLicencia())) {
            throw new ConflictoException(
                "La licencia profesional ya está registrada");
        }

        Enfermero e = new Enfermero();
        e.setUsuario(usuario);
        asignar(e, datos);

        return convertir(repositorio.save(e));
    }

    @Transactional
    public EnfermeroResponse actualizar(
            Long id, EnfermeroRequest datos) {

        Enfermero e = buscar(id);

        if (!e.getUsuario().getId().equals(datos.usuarioId())) {
            throw new ReglaNegocioException(
                "No se permite cambiar la cuenta de usuario "
                + "asociada al enfermero");
        }

        repositorio.findByCedula(datos.cedula())
            .ifPresent(otro -> {
                if (!otro.getId().equals(id)) {
                    throw new ConflictoException(
                        "La cédula pertenece a otro enfermero");
                }
            });

        if (repositorio.existsByNumeroLicencia(
                datos.numeroLicencia())
                && !e.getNumeroLicencia().equals(
                    datos.numeroLicencia())) {
            throw new ConflictoException(
                "La licencia pertenece a otro enfermero");
        }

        asignar(e, datos);
        return convertir(repositorio.save(e));
    }

    private void asignar(Enfermero e, EnfermeroRequest datos) {
        e.setCedula(datos.cedula());
        e.setNumeroLicencia(datos.numeroLicencia());
        e.setTelefono(datos.telefono());
        e.setEspecialidad(datos.especialidad());
    }

    @Transactional
    public void desactivar(Long id) {
        Enfermero e = buscar(id);
        e.setActivo(false);
        e.getUsuario().setActivo(false);
        repositorio.save(e);
    }
}
