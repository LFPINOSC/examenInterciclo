package com.andres.odontologia_api.servicio;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.andres.odontologia_api.modelo.Cita;
import com.andres.odontologia_api.modelo.Pago;
import com.andres.odontologia_api.repositorio.CitaRepositorio;
import com.andres.odontologia_api.repositorio.PagoRepositorio;

// Servicio encargado de gestionar los pagos de las citas
@Service
public class PagoServicio {

    // Repositorios necesarios para trabajar con PostgreSQL
    private final PagoRepositorio pagoRepositorio;
    private final CitaRepositorio citaRepositorio;

    // Constructor para inyectar los repositorios
    public PagoServicio(
            PagoRepositorio pagoRepositorio,
            CitaRepositorio citaRepositorio) {

        this.pagoRepositorio = pagoRepositorio;
        this.citaRepositorio = citaRepositorio;
    }

    // GET: listar todos los pagos registrados
    public List<Pago> listar() {
        return pagoRepositorio.findAll();
    }

    // GET: buscar un pago por su ID
    public Pago buscarPorId(Long id) {
        return pagoRepositorio.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Pago no encontrado"
                ));
    }

    // GET: buscar el pago asociado a una cita
    public Pago buscarPorCita(Long citaId) {
        return pagoRepositorio.findByCitaId(citaId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La cita no tiene un pago registrado"
                ));
    }

    // Validar el monto y metodo de pago
    private void validarDatos(
            BigDecimal monto,
            String metodoPago) {

        if (monto == null ||
                monto.compareTo(BigDecimal.ZERO) < 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El monto debe ser mayor o igual a cero"
            );
        }

        if (monto.scale() > 2 ||
                monto.compareTo(new BigDecimal("99999999.99")) > 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El monto no tiene un formato valido"
            );
        }

        if (metodoPago != null && metodoPago.length() > 30) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El metodo de pago es demasiado largo"
            );
        }
    }

    // POST: registrar un pago pendiente
    @Transactional
    public Pago guardar(
            Long citaId,
            BigDecimal monto,
            String metodoPago) {

        if (citaId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La cita es obligatoria"
            );
        }

        validarDatos(monto, metodoPago);

        // Comprobar que la cita exista
        Cita cita = citaRepositorio.findById(citaId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Cita no encontrada"
                ));

        // No registrar pagos en citas canceladas
        if ("CANCELADA".equals(cita.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede registrar un pago para una cita cancelada"
            );
        }

        // Cada cita solo puede tener un registro de pago
        if (pagoRepositorio.existsByCitaId(citaId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La cita ya tiene un pago registrado"
            );
        }

        // Crear un pago inicialmente pendiente
        Pago pago = new Pago();

        pago.setCita(cita);
        pago.setMonto(monto);
        pago.setMetodoPago(metodoPago);
        pago.setFechaPago(null);
        pago.setEstado("PENDIENTE");

        return pagoRepositorio.save(pago);
    }

    // PUT: actualizar los datos de un pago pendiente
    @Transactional
    public Pago actualizar(
            Long id,
            BigDecimal monto,
            String metodoPago) {

        Pago pago = buscarPorId(id);

        // Solo se pueden modificar pagos pendientes
        if (!"PENDIENTE".equals(pago.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo se pueden actualizar pagos pendientes"
            );
        }

        validarDatos(monto, metodoPago);

        pago.setMonto(monto);
        pago.setMetodoPago(metodoPago);

        return pagoRepositorio.save(pago);
    }

    // PATCH: confirmar que el pago fue realizado
    @Transactional
    public Pago marcarPagado(Long id) {

        Pago pago = buscarPorId(id);

        // Si ya esta pagado, devolver el registro
        if ("PAGADO".equals(pago.getEstado())) {
            return pago;
        }

        if ("CANCELADO".equals(pago.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede pagar un registro cancelado"
            );
        }

        if ("CANCELADA".equals(pago.getCita().getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La cita esta cancelada"
            );
        }

        // El metodo de pago es obligatorio al confirmar
        if (pago.getMetodoPago() == null ||
                pago.getMetodoPago().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debes indicar el metodo de pago"
            );
        }

        // Registrar estado y fecha del pago
        pago.setEstado("PAGADO");
        pago.setFechaPago(LocalDateTime.now());

        return pagoRepositorio.save(pago);
    }

    // PATCH: cancelar un pago pendiente
    @Transactional
    public Pago cancelar(Long id) {

        Pago pago = buscarPorId(id);

        // Los pagos realizados requieren otro proceso
        if ("PAGADO".equals(pago.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede cancelar un pago realizado"
            );
        }

        if ("CANCELADO".equals(pago.getEstado())) {
            return pago;
        }

        pago.setEstado("CANCELADO");
        pago.setFechaPago(null);

        return pagoRepositorio.save(pago);
    }

    // DELETE: eliminar un pago pendiente o cancelado
    @Transactional
    public void eliminar(Long id) {

        Pago pago = buscarPorId(id);

        // Mantener el historial de pagos realizados
        if ("PAGADO".equals(pago.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede eliminar un pago realizado"
            );
        }

        pagoRepositorio.delete(pago);
        pagoRepositorio.flush();
    }
}