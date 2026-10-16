package com.universidad.matriculas.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.universidad.matriculas.dto.EstudianteRequest;
import com.universidad.matriculas.dto.EstudianteResponse;
import com.universidad.matriculas.model.Carrera;
import com.universidad.matriculas.model.Estudiante;
import com.universidad.matriculas.model.Rol;
import com.universidad.matriculas.model.Usuario;
import com.universidad.matriculas.repository.CarreraRepository;
import com.universidad.matriculas.repository.EstudianteRepository;
import com.universidad.matriculas.repository.UsuarioRepository;

/**
 * Lógica de negocio de estudiantes.
 */
@Service
public class EstudianteService {

    private final EstudianteRepository estudianteRepository;
    private final CarreraRepository carreraRepository;
    private final UsuarioRepository usuarioRepository;

    public EstudianteService(
            EstudianteRepository estudianteRepository,
            CarreraRepository carreraRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.estudianteRepository = estudianteRepository;
        this.carreraRepository = carreraRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Lista todos los estudiantes.
     * Se utilizará únicamente para ADMIN.
     */
    public List<EstudianteResponse> listar() {

        return estudianteRepository
                .findAll()
                .stream()
                .map(this::convertirRespuesta)
                .toList();
    }

    public EstudianteResponse buscarPorId(Long id) {

        Estudiante estudiante =
                obtenerEntidad(id);

        return convertirRespuesta(estudiante);
    }

    /**
     * Obtiene únicamente el perfil asociado
     * al usuario que inició sesión.
     */
    public EstudianteResponse buscarPorCorreo(
            String correo
    ) {

        Estudiante estudiante =
                estudianteRepository
                        .findByUsuarioCorreo(correo)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No existe un perfil de estudiante asociado a este usuario."
                                )
                        );

        return convertirRespuesta(estudiante);
    }

    /**
     * Crea un nuevo perfil de estudiante.
     */
    public EstudianteResponse guardar(
            EstudianteRequest request
    ) {

        if (estudianteRepository
                .existsByCedula(request.getCedula())) {

            throw new IllegalArgumentException(
                    "La cédula ya está registrada."
            );
        }

        if (estudianteRepository
                .existsByUsuarioId(request.getUsuarioId())) {

            throw new IllegalArgumentException(
                    "El usuario ya tiene un perfil de estudiante."
            );
        }

        Carrera carrera =
                carreraRepository
                        .findById(request.getCarreraId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Carrera no encontrada."
                                )
                        );

        Usuario usuario =
                usuarioRepository
                        .findById(request.getUsuarioId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Usuario no encontrado."
                                )
                        );

        // Solo cuentas ESTUDIANTE pueden
        // asociarse a un perfil de estudiante.
        if (usuario.getRol() != Rol.ESTUDIANTE) {

            throw new IllegalArgumentException(
                    "El usuario seleccionado no tiene rol ESTUDIANTE."
            );
        }

        Estudiante estudiante =
                new Estudiante();

        estudiante.setCedula(
                request.getCedula()
        );

        estudiante.setNombres(
                request.getNombres()
        );

        estudiante.setApellidos(
                request.getApellidos()
        );

        estudiante.setTelefono(
                request.getTelefono()
        );

        estudiante.setCarrera(carrera);
        estudiante.setUsuario(usuario);

        return convertirRespuesta(
                estudianteRepository.save(estudiante)
        );
    }

    /**
     * Actualiza los datos del estudiante.
     */
    public EstudianteResponse actualizar(
            Long id,
            EstudianteRequest request
    ) {

        Estudiante estudiante =
                obtenerEntidad(id);

        Carrera carrera =
                carreraRepository
                        .findById(request.getCarreraId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Carrera no encontrada."
                                )
                        );

        estudiante.setCedula(
                request.getCedula()
        );

        estudiante.setNombres(
                request.getNombres()
        );

        estudiante.setApellidos(
                request.getApellidos()
        );

        estudiante.setTelefono(
                request.getTelefono()
        );

        estudiante.setCarrera(carrera);

        return convertirRespuesta(
                estudianteRepository.save(estudiante)
        );
    }

    public void eliminar(Long id) {

        Estudiante estudiante =
                obtenerEntidad(id);

        estudianteRepository.delete(estudiante);
    }

    private Estudiante obtenerEntidad(Long id) {

        return estudianteRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Estudiante no encontrado."
                        )
                );
    }

    /**
     * Convierte la entidad en un DTO seguro.
     *
     * De esta forma nunca enviamos la contraseña
     * del usuario al frontend.
     */
    private EstudianteResponse convertirRespuesta(
            Estudiante estudiante
    ) {

        return new EstudianteResponse(
                estudiante.getId(),
                estudiante.getCedula(),
                estudiante.getNombres(),
                estudiante.getApellidos(),
                estudiante.getTelefono(),
                estudiante.getCarrera().getId(),
                estudiante.getCarrera().getNombre(),
                estudiante.getUsuario().getId(),
                estudiante.getUsuario().getCorreo()
        );
    }
}