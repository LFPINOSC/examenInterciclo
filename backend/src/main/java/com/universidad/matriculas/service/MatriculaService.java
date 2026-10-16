package com.universidad.matriculas.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.universidad.matriculas.dto.AsignaturaMatriculaResponse;
import com.universidad.matriculas.dto.MatriculaRequest;
import com.universidad.matriculas.dto.MatriculaResponse;
import com.universidad.matriculas.model.Asignatura;
import com.universidad.matriculas.model.DetalleMatricula;
import com.universidad.matriculas.model.EstadoMatricula;
import com.universidad.matriculas.model.Estudiante;
import com.universidad.matriculas.model.Matricula;
import com.universidad.matriculas.repository.AsignaturaRepository;
import com.universidad.matriculas.repository.EstudianteRepository;
import com.universidad.matriculas.repository.MatriculaRepository;

/**
 * Lógica de negocio para las matrículas.
 */
@Service
@Transactional
public class MatriculaService {

    private final MatriculaRepository matriculaRepository;
    private final EstudianteRepository estudianteRepository;
    private final AsignaturaRepository asignaturaRepository;

    public MatriculaService(
            MatriculaRepository matriculaRepository,
            EstudianteRepository estudianteRepository,
            AsignaturaRepository asignaturaRepository
    ) {
        this.matriculaRepository = matriculaRepository;
        this.estudianteRepository = estudianteRepository;
        this.asignaturaRepository = asignaturaRepository;
    }

    /**
     * ADMIN puede consultar todas las matrículas.
     */
    public List<MatriculaResponse> listar() {

        return matriculaRepository
                .findAll()
                .stream()
                .map(this::convertirRespuesta)
                .toList();
    }

    /**
     * ESTUDIANTE consulta únicamente
     * sus propias matrículas.
     */
    public List<MatriculaResponse> listarPropias(
            String correo
    ) {

        return matriculaRepository
                .findByEstudianteUsuarioCorreo(correo)
                .stream()
                .map(this::convertirRespuesta)
                .toList();
    }

    /**
     * ADMIN crea una matrícula para
     * cualquier estudiante.
     */
    public MatriculaResponse guardar(
            MatriculaRequest request
    ) {

        Estudiante estudiante =
                estudianteRepository
                        .findById(request.getEstudianteId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Estudiante no encontrado."
                                )
                        );

        return crearMatricula(
                estudiante,
                request
        );
    }

    /**
     * El estudiante autenticado crea
     * una matrícula únicamente para sí mismo.
     */
    public MatriculaResponse guardarPropia(
            String correo,
            MatriculaRequest request
    ) {

        Estudiante estudiante =
                estudianteRepository
                        .findByUsuarioCorreo(correo)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No existe perfil de estudiante."
                                )
                        );

        return crearMatricula(
                estudiante,
                request
        );
    }

    private MatriculaResponse crearMatricula(
            Estudiante estudiante,
            MatriculaRequest request
    ) {

        if (request.getAsignaturaIds() == null
                || request.getAsignaturaIds().isEmpty()) {

            throw new IllegalArgumentException(
                    "Debe seleccionar al menos una asignatura."
            );
        }

        Matricula matricula =
                new Matricula();

        matricula.setFecha(
                LocalDate.now()
        );

        matricula.setPeriodo(
                request.getPeriodo()
        );

        matricula.setEstado(
                EstadoMatricula.ACTIVA
        );

        matricula.setEstudiante(
                estudiante
        );

        // Elimina IDs repetidos antes de crear detalles
        for (Long asignaturaId :
                request.getAsignaturaIds()
                        .stream()
                        .distinct()
                        .toList()) {

            Asignatura asignatura =
                    asignaturaRepository
                            .findById(asignaturaId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Asignatura no encontrada: "
                                                    + asignaturaId
                                    )
                            );

            DetalleMatricula detalle =
                    new DetalleMatricula();

            detalle.setMatricula(
                    matricula
            );

            detalle.setAsignatura(
                    asignatura
            );

            matricula.getDetalles()
                    .add(detalle);
        }

        Matricula guardada =
                matriculaRepository.save(
                        matricula
                );

        return convertirRespuesta(
                guardada
        );
    }

    /**
     * ADMIN elimina una matrícula.
     */
    public void eliminar(Long id) {

        Matricula matricula =
                matriculaRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Matrícula no encontrada."
                                )
                        );

        matriculaRepository.delete(
                matricula
        );
    }

    /**
     * ESTUDIANTE puede cancelar únicamente
     * una matrícula que le pertenece.
     */
    public MatriculaResponse cancelarPropia(
            Long id,
            String correo
    ) {

        Matricula matricula =
                matriculaRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Matrícula no encontrada."
                                )
                        );

        if (!matricula
                .getEstudiante()
                .getUsuario()
                .getCorreo()
                .equals(correo)) {

            throw new IllegalArgumentException(
                    "No puede modificar una matrícula de otro estudiante."
            );
        }

        matricula.setEstado(
                EstadoMatricula.CANCELADA
        );

        return convertirRespuesta(
                matriculaRepository.save(
                        matricula
                )
        );
    }

    /**
     * Convierte la entidad a DTO y evita
     * problemas de relaciones recursivas.
     */
    private MatriculaResponse convertirRespuesta(
            Matricula matricula
    ) {

        List<AsignaturaMatriculaResponse> asignaturas =
                matricula.getDetalles()
                        .stream()
                        .map(detalle -> {

                            Asignatura asignatura =
                                    detalle.getAsignatura();

                            return new AsignaturaMatriculaResponse(
                                    asignatura.getId(),
                                    asignatura.getCodigo(),
                                    asignatura.getNombre(),
                                    asignatura.getCreditos()
                            );
                        })
                        .toList();

        String nombreCompleto =
                matricula
                        .getEstudiante()
                        .getNombres()
                        + " "
                        + matricula
                        .getEstudiante()
                        .getApellidos();

        return new MatriculaResponse(
                matricula.getId(),
                matricula.getFecha(),
                matricula.getPeriodo(),
                matricula.getEstado().name(),
                matricula.getEstudiante().getId(),
                nombreCompleto,
                asignaturas
        );
    }
}