package com.kevmarca.inventario.service;

import com.kevmarca.inventario.exception.RecursoNoEncontradoException;
import com.kevmarca.inventario.exception.ReglaNegocioException;
import com.kevmarca.inventario.model.Categoria;
import com.kevmarca.inventario.repository.CategoriaRepository;
import com.kevmarca.inventario.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    public CategoriaService(CategoriaRepository categoriaRepository, ProductoRepository productoRepository) {
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
    }

    public List<Categoria> listar() {
        return categoriaRepository.findAll();
    }

    public Categoria obtener(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría con id " + id + " no encontrada"));
    }

    @Transactional
    public Categoria crear(Categoria datos) {
        if (categoriaRepository.existsByNombreIgnoreCase(datos.getNombre().trim())) {
            throw new ReglaNegocioException("Ya existe una categoría con ese nombre");
        }
        datos.setId(null);
        datos.setNombre(datos.getNombre().trim());
        return categoriaRepository.save(datos);
    }

    @Transactional
    public Categoria actualizar(Long id, Categoria datos) {
        Categoria actual = obtener(id);
        if (categoriaRepository.existsByNombreIgnoreCaseAndIdNot(datos.getNombre().trim(), id)) {
            throw new ReglaNegocioException("Ya existe otra categoría con ese nombre");
        }
        actual.setNombre(datos.getNombre().trim());
        actual.setDescripcion(datos.getDescripcion());
        return categoriaRepository.save(actual);
    }

    @Transactional
    public void eliminar(Long id) {
        Categoria categoria = obtener(id);
        if (productoRepository.existsByCategoriaId(id)) {
            throw new ReglaNegocioException("No se puede eliminar: la categoría tiene productos asociados");
        }
        categoriaRepository.delete(categoria);
    }
}
