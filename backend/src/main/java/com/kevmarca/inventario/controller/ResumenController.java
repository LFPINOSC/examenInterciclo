package com.kevmarca.inventario.controller;

import com.kevmarca.inventario.dto.ResumenResponse;
import com.kevmarca.inventario.model.Producto;
import com.kevmarca.inventario.repository.CategoriaRepository;
import com.kevmarca.inventario.repository.ProductoRepository;
import com.kevmarca.inventario.repository.ProveedorRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

/** GET /api/resumen -> indicadores del dashboard. */
@RestController
@RequestMapping("/api/resumen")
public class ResumenController {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProveedorRepository proveedorRepository;

    public ResumenController(ProductoRepository productoRepository,
                             CategoriaRepository categoriaRepository,
                             ProveedorRepository proveedorRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.proveedorRepository = proveedorRepository;
    }

    @GetMapping
    public ResumenResponse resumen() {
        List<Producto> productos = productoRepository.findAll();

        // Valor del inventario = suma de (stock x precio de compra)
        BigDecimal valor = productos.stream()
                .map(p -> p.getPrecioCompra().multiply(BigDecimal.valueOf(p.getStock())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long stockBajo = productos.stream().filter(Producto::isStockBajo).count();

        return new ResumenResponse(
                productos.size(),
                categoriaRepository.count(),
                proveedorRepository.count(),
                stockBajo,
                valor);
    }
}
