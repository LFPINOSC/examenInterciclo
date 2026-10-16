package com.universidad.matriculas.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.universidad.matriculas.dto.AsignaturaRequest;
import com.universidad.matriculas.model.Asignatura;
import com.universidad.matriculas.model.Carrera;
import com.universidad.matriculas.repository.AsignaturaRepository;
import com.universidad.matriculas.repository.CarreraRepository;

/**
 * Lógica de negocio para las asignaturas.
 */
@Service
public class AsignaturaService {

    private final AsignaturaRepository asignaturaRepository;
    private final CarreraRepository carreraRepository;

    public AsignaturaService(
            AsignaturaRepository asignaturaRepository,
            CarreraRepository carreraRepository
    ) {
        this.asignaturaRepository = asignaturaRepository;
        this.carreraRepository = carreraRepository;
    }

    /**
     * Lista todas las asignaturas.
     */
    public List<Asignatura> listar() {
        return asignaturaRepository.findAll();
    }

    /**
     * Busca una asignatura por ID.
     */
    public Asignatura buscarPorId(Long id) {

        return asignaturaRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Asignatura no encontrada."
                        )
                );
    }

    /**
     * Lista asignaturas de una carrera específica.
     */
    public List<Asignatura> listarPorCarrera(Long carreraId) {

        return asignaturaRepository
                .findByCarreraId(carreraId);
    }

    /**
     * Crea una nueva asignatura.
     */
    public Asignatura guardar(
            AsignaturaRequest request
    ) {

        if (asignaturaRepository
                .existsByCodigoIgnoreCase(
                        request.getCodigo()
                )) {

            throw new IllegalArgumentException(
                    "Ya existe una asignatura con ese código."
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

        Asignatura asignatura =
                new Asignatura();

        asignatura.setCodigo(
                request.getCodigo()
        );

        asignatura.setNombre(
                request.getNombre()
        );

        asignatura.setCreditos(
                request.getCreditos()
        );

        asignatura.setNivel(
                request.getNivel()
        );

        asignatura.setActiva(
                request.getActiva() == null
                        ? true
                        : request.getActiva()
        );

        asignatura.setCarrera(carrera);

        return asignaturaRepository
                .save(asignatura);
    }

    /**
     * Actualiza una asignatura existente.
     */
    public Asignatura actualizar(
            Long id,
            AsignaturaRequest request
    ) {

        Asignatura asignatura =
                buscarPorId(id);

        Carrera carrera =
                carreraRepository
                        .findById(request.getCarreraId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Carrera no encontrada."
                                )
                        );

        asignatura.setCodigo(
                request.getCodigo()
        );

        asignatura.setNombre(
                request.getNombre()
        );

        asignatura.setCreditos(
                request.getCreditos()
        );

        asignatura.setNivel(
                request.getNivel()
        );

        if (request.getActiva() != null) {
            asignatura.setActiva(
                    request.getActiva()
            );
        }

        asignatura.setCarrera(carrera);

        return asignaturaRepository
                .save(asignatura);
    }

    /**
     * Elimina una asignatura.
     */
    public void eliminar(Long id) {

        Asignatura asignatura =
                buscarPorId(id);

        asignaturaRepository
                .delete(asignatura);
    }
}