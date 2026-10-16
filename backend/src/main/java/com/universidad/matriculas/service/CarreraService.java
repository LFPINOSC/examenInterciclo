package com.universidad.matriculas.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.universidad.matriculas.model.Carrera;
import com.universidad.matriculas.repository.CarreraRepository;

/**
 * Contiene la lógica de negocio relacionada
 * con las carreras universitarias.
 */
@Service
public class CarreraService {

    private final CarreraRepository carreraRepository;

    public CarreraService(
            CarreraRepository carreraRepository
    ) {
        this.carreraRepository = carreraRepository;
    }

    /**
     * Retorna todas las carreras.
     */
    public List<Carrera> listar() {

        return carreraRepository.findAll();
    }

    /**
     * Busca una carrera por su identificador.
     */
    public Carrera buscarPorId(Long id) {

        return carreraRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Carrera no encontrada."
                        )
                );
    }

    /**
     * Guarda una nueva carrera.
     */
    public Carrera guardar(Carrera carrera) {

        if (carreraRepository
                .existsByNombreIgnoreCase(
                        carrera.getNombre()
                )) {

            throw new IllegalArgumentException(
                    "Ya existe una carrera con ese nombre."
            );
        }

        carrera.setId(null);

        if (carrera.getActiva() == null) {
            carrera.setActiva(true);
        }

        return carreraRepository.save(carrera);
    }

    /**
     * Actualiza una carrera existente.
     */
    public Carrera actualizar(
            Long id,
            Carrera datos
    ) {

        Carrera carrera =
                buscarPorId(id);

        carrera.setNombre(
                datos.getNombre()
        );

        carrera.setDescripcion(
                datos.getDescripcion()
        );

        if (datos.getActiva() != null) {
            carrera.setActiva(
                    datos.getActiva()
            );
        }

        return carreraRepository.save(
                carrera
        );
    }

    /**
     * Elimina una carrera.
     */
    public void eliminar(Long id) {

        Carrera carrera =
                buscarPorId(id);

        carreraRepository.delete(carrera);
    }
}