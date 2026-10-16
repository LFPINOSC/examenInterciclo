package com.kevmarca.inventario.service;

import com.kevmarca.inventario.dto.ProductoRequest;
import com.kevmarca.inventario.exception.RecursoNoEncontradoException;
import com.kevmarca.inventario.exception.ReglaNegocioException;
import com.kevmarca.inventario.model.Producto;
import com.kevmarca.inventario.repository.MovimientoInventarioRepository;
import com.kevmarca.inventario.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final MovimientoInventarioRepository movimientoRepository;
    private final CategoriaService categoriaService;
    private final ProveedorService proveedorService;

    public ProductoService(ProductoRepository productoRepository,
                           MovimientoInventarioRepository movimientoRepository,
                           CategoriaService categoriaService,
                           ProveedorService proveedorService) {
        this.productoRepository = productoRepository;
        this.movimientoRepository = movimientoRepository;
        this.categoriaService = categoriaService;
        this.proveedorService = proveedorService;
    }

    public List<Producto> listar(String buscar) {
        if (buscar == null || buscar.isBlank()) {
            return productoRepository.findAll();
        }
        return productoRepository.findByNombreContainingIgnoreCaseOrCodigoContainingIgnoreCase(buscar, buscar);
    }

    public List<Producto> listarStockBajo() {
        return productoRepository.findConStockBajo();
    }

    public Producto obtener(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto con id " + id + " no encontrado"));
    }

    @Transactional
    public Producto crear(ProductoRequest req) {
        if (productoRepository.existsByCodigoIgnoreCase(req.codigo().trim())) {
            throw new ReglaNegocioException("Ya existe un producto con el código " + req.codigo());
        }
        Producto p = new Producto();
        copiarDatos(req, p);
        p.setStock(req.stock()); // stock inicial
        return productoRepository.save(p);
    }

    /**
     * Al actualizar NO se modifica el stock: el stock solo cambia mediante
     * movimientos de inventario (entradas y salidas), para que quede historial.
     */
    @Transactional
    public Producto actualizar(Long id, ProductoRequest req) {
        Producto p = obtener(id);
        if (productoRepository.existsByCodigoIgnoreCaseAndIdNot(req.codigo().trim(), id)) {
            throw new ReglaNegocioException("Ya existe otro producto con el código " + req.codigo());
        }
        copiarDatos(req, p);
        return productoRepository.save(p);
    }

    @Transactional
    public void eliminar(Long id) {
        Producto p = obtener(id);
        if (movimientoRepository.existsByProductoId(id)) {
            throw new ReglaNegocioException(
                    "No se puede eliminar: el producto tiene movimientos registrados. Puede desactivarlo.");
        }
        productoRepository.delete(p);
    }

    private void copiarDatos(ProductoRequest req, Producto p) {
        if (req.precioVenta().compareTo(req.precioCompra()) < 0) {
            throw new ReglaNegocioException("El precio de venta no puede ser menor al precio de compra");
        }
        p.setCodigo(req.codigo().trim().toUpperCase());
        p.setNombre(req.nombre().trim());
        p.setDescripcion(req.descripcion());
        p.setPrecioCompra(req.precioCompra());
        p.setPrecioVenta(req.precioVenta());
        p.setStockMinimo(req.stockMinimo());
        p.setActivo(req.activo() == null || req.activo());
        p.setCategoria(categoriaService.obtener(req.categoriaId()));
        p.setProveedor(proveedorService.obtener(req.proveedorId()));
    }
}
