package com.kevmarca.inventario.service;

import com.kevmarca.inventario.dto.MovimientoRequest;
import com.kevmarca.inventario.exception.RecursoNoEncontradoException;
import com.kevmarca.inventario.exception.ReglaNegocioException;
import com.kevmarca.inventario.model.MovimientoInventario;
import com.kevmarca.inventario.model.Producto;
import com.kevmarca.inventario.model.TipoMovimiento;
import com.kevmarca.inventario.model.Usuario;
import com.kevmarca.inventario.repository.MovimientoInventarioRepository;
import com.kevmarca.inventario.repository.ProductoRepository;
import com.kevmarca.inventario.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Lógica principal del inventario: cada entrada suma stock y cada salida lo resta.
 * Todo se hace dentro de una transacción: si algo falla, no se guarda ni el
 * movimiento ni el cambio de stock (atomicidad).
 */
// 📌 CORAZÓN DEL INVENTARIO: aquí sube o baja el stock
@Service
public class MovimientoService {

    private final MovimientoInventarioRepository movimientoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoService productoService;

    public MovimientoService(MovimientoInventarioRepository movimientoRepository,
                             ProductoRepository productoRepository,
                             UsuarioRepository usuarioRepository,
                             ProductoService productoService) {
        this.movimientoRepository = movimientoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.productoService = productoService;
    }

    public List<MovimientoInventario> listar(Long productoId) {
        if (productoId != null) {
            return movimientoRepository.findByProductoIdOrderByFechaDesc(productoId);
        }
        return movimientoRepository.findAllByOrderByFechaDesc();
    }

    public MovimientoInventario obtener(Long id) {
        return movimientoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Movimiento con id " + id + " no encontrado"));
    }

    // @Transactional: stock + movimiento se guardan JUNTOS o no se guarda nada
    @Transactional
    public MovimientoInventario registrar(MovimientoRequest req, String usernameActual) {
        Producto producto = productoService.obtener(req.productoId());
        Usuario usuario = usuarioRepository.findByUsername(usernameActual)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        if (!producto.isActivo()) {
            throw new ReglaNegocioException("El producto está desactivado");
        }

        // Venta: primero valida que haya stock suficiente
        if (req.tipo() == TipoMovimiento.SALIDA) {
            if (producto.getStock() < req.cantidad()) {
                throw new ReglaNegocioException("Stock insuficiente. Disponible: " + producto.getStock());
            }
            producto.setStock(producto.getStock() - req.cantidad());
        } else {
            producto.setStock(producto.getStock() + req.cantidad());
        }
        productoRepository.save(producto);

        MovimientoInventario m = new MovimientoInventario();
        m.setTipo(req.tipo());
        m.setCantidad(req.cantidad());
        m.setMotivo(req.motivo());
        m.setProducto(producto);
        m.setUsuario(usuario);
        // Se "congela" el precio del momento: venta para SALIDA, compra para ENTRADA
        m.setPrecioUnitario(req.tipo() == TipoMovimiento.SALIDA ? producto.getPrecioVenta() : producto.getPrecioCompra());
        m.setCostoUnitario(producto.getPrecioCompra());
        return movimientoRepository.save(m);
    }

    /** Anula un movimiento revirtiendo su efecto sobre el stock. */
    // Anular = deshacer: una entrada resta, una venta devuelve el stock
    @Transactional
    public void anular(Long id) {
        MovimientoInventario m = obtener(id);
        Producto producto = m.getProducto();

        if (m.getTipo() == TipoMovimiento.ENTRADA) {
            if (producto.getStock() < m.getCantidad()) {
                throw new ReglaNegocioException(
                        "No se puede anular: el stock actual es menor que la cantidad que ingresó");
            }
            producto.setStock(producto.getStock() - m.getCantidad());
        } else {
            producto.setStock(producto.getStock() + m.getCantidad());
        }
        productoRepository.save(producto);
        movimientoRepository.delete(m);
    }
}
