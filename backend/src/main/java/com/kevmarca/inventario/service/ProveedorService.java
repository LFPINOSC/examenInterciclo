package com.kevmarca.inventario.service;

import com.kevmarca.inventario.exception.RecursoNoEncontradoException;
import com.kevmarca.inventario.exception.ReglaNegocioException;
import com.kevmarca.inventario.model.Proveedor;
import com.kevmarca.inventario.repository.ProductoRepository;
import com.kevmarca.inventario.repository.ProveedorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;
    private final ProductoRepository productoRepository;

    public ProveedorService(ProveedorRepository proveedorRepository, ProductoRepository productoRepository) {
        this.proveedorRepository = proveedorRepository;
        this.productoRepository = productoRepository;
    }

    public List<Proveedor> listar() {
        return proveedorRepository.findAll();
    }

    public Proveedor obtener(Long id) {
        return proveedorRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Proveedor con id " + id + " no encontrado"));
    }

    @Transactional
    public Proveedor crear(Proveedor datos) {
        if (proveedorRepository.existsByRuc(datos.getRuc())) {
            throw new ReglaNegocioException("Ya existe un proveedor con ese RUC");
        }
        datos.setId(null);
        return proveedorRepository.save(datos);
    }

    @Transactional
    public Proveedor actualizar(Long id, Proveedor datos) {
        Proveedor actual = obtener(id);
        if (proveedorRepository.existsByRucAndIdNot(datos.getRuc(), id)) {
            throw new ReglaNegocioException("Ya existe otro proveedor con ese RUC");
        }
        actual.setRuc(datos.getRuc());
        actual.setRazonSocial(datos.getRazonSocial());
        actual.setTelefono(datos.getTelefono());
        actual.setEmail(datos.getEmail());
        actual.setDireccion(datos.getDireccion());
        return proveedorRepository.save(actual);
    }

    @Transactional
    public void eliminar(Long id) {
        Proveedor proveedor = obtener(id);
        if (productoRepository.existsByProveedorId(id)) {
            throw new ReglaNegocioException("No se puede eliminar: el proveedor tiene productos asociados");
        }
        proveedorRepository.delete(proveedor);
    }
}
