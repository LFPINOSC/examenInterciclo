package com.andres.odontologia_api.servicio;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.andres.odontologia_api.modelo.Cita;
import com.andres.odontologia_api.modelo.Pago;
import com.andres.odontologia_api.repositorio.CitaRepositorio;
import com.andres.odontologia_api.repositorio.OdontologoRepositorio;
import com.andres.odontologia_api.repositorio.PacienteRepositorio;
import com.andres.odontologia_api.repositorio.PagoRepositorio;
import com.andres.odontologia_api.repositorio.ServicioRepositorio;

// Gestiona las operaciones y reglas de las citas odontologicas
@Service
public class CitaServicio {

    // Repositorios utilizados para acceder a PostgreSQL
    private final CitaRepositorio citaRepositorio;
    private final PacienteRepositorio pacienteRepositorio;
    private final OdontologoRepositorio odontologoRepositorio;
    private final ServicioRepositorio servicioRepositorio;
    private final PagoRepositorio pagoRepositorio;

    // Inyeccion de dependencias
    public CitaServicio(
            CitaRepositorio citaRepositorio,
            PacienteRepositorio pacienteRepositorio,
            OdontologoRepositorio odontologoRepositorio,
            ServicioRepositorio servicioRepositorio,
            PagoRepositorio pagoRepositorio) {

        this.citaRepositorio = citaRepositorio;
        this.pacienteRepositorio = pacienteRepositorio;
        this.odontologoRepositorio = odontologoRepositorio;
        this.servicioRepositorio = servicioRepositorio;
        this.pagoRepositorio = pagoRepositorio;
    }

    // GET: listar todas las citas
    public List<Cita> listar() {
        return citaRepositorio.findAll();
    }

    // GET: buscar una cita por ID
    public Cita buscarPorId(Long id) {
        return citaRepositorio.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Cita no encontrada"
                ));
    }

    // GET: consultar citas de un paciente
    public List<Cita> listarPorPaciente(Long pacienteId) {
        return citaRepositorio.findByPacienteId(pacienteId);
    }

    // GET: consultar citas de un odontologo
    public List<Cita> listarPorOdontologo(Long odontologoId) {
        return citaRepositorio.findByOdontologoId(odontologoId);
    }

    // Valida que la fecha sea futura y los IDs existan
    private void validarDatos(
            Long pacienteId,
            Long odontologoId,
            Long servicioId,
            LocalDateTime fechaHora) {

        if (pacienteId == null ||
                odontologoId == null ||
                servicioId == null ||
                fechaHora == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Paciente, odontologo, servicio y fecha son obligatorios"
            );
        }

        if (!fechaHora.isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La cita debe tener una fecha futura"
            );
        }
    }

    // Verifica que el odontologo no tenga otra cita
    // no cancelada a la misma hora de inicio
    private void validarDisponibilidad(
            Long odontologoId,
            LocalDateTime fechaHora,
            Long idExcluir) {

        boolean ocupado = citaRepositorio
                .findByOdontologoId(odontologoId)
                .stream()
                .anyMatch(cita ->
                        !"CANCELADA".equals(cita.getEstado())
                        && cita.getFechaHora().equals(fechaHora)
                        && !cita.getId().equals(idExcluir)
                );

        if (ocupado) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El odontologo ya tiene una cita en esa fecha y hora"
            );
        }
    }

    // POST: registrar una nueva cita
    @Transactional
    public Cita guardar(
            Long pacienteId,
            Long odontologoId,
            Long servicioId,
            LocalDateTime fechaHora,
            String observaciones) {

        validarDatos(
                pacienteId,
                odontologoId,
                servicioId,
                fechaHora
        );

        // Buscar las entidades relacionadas
        var paciente = pacienteRepositorio.findById(pacienteId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Paciente no encontrado"
                ));

        var odontologo = odontologoRepositorio.findById(odontologoId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Odontologo no encontrado"
                ));

        var servicio = servicioRepositorio.findById(servicioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Servicio no encontrado"
                ));

        // Evitar citas duplicadas
        validarDisponibilidad(odontologoId, fechaHora, null);

        // Crear la cita
        Cita cita = new Cita();

        cita.setPaciente(paciente);
        cita.setOdontologo(odontologo);
        cita.setServicio(servicio);
        cita.setFechaHora(fechaHora);
        cita.setEstado("PENDIENTE");
        cita.setObservaciones(observaciones);

        return citaRepositorio.save(cita);
    }

    // PUT: actualizar los datos de una cita existente
    @Transactional
    public Cita actualizar(
            Long id,
            Long pacienteId,
            Long odontologoId,
            Long servicioId,
            LocalDateTime fechaHora,
            String observaciones) {

        Cita cita = buscarPorId(id);

        // No modificar citas terminadas o canceladas
        if ("CANCELADA".equals(cita.getEstado()) ||
                "ATENDIDA".equals(cita.getEstado())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede modificar esta cita"
            );
        }

        // No modificar una cita que ya fue pagada
        Pago pago = pagoRepositorio.findByCitaId(id).orElse(null);

        if (pago != null && "PAGADO".equals(pago.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La cita ya tiene un pago realizado"
            );
        }

        validarDatos(
                pacienteId,
                odontologoId,
                servicioId,
                fechaHora
        );

        validarDisponibilidad(odontologoId, fechaHora, id);

        // Consultar las relaciones actualizadas
        var paciente = pacienteRepositorio.findById(pacienteId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Paciente no encontrado"
                ));

        var odontologo = odontologoRepositorio.findById(odontologoId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Odontologo no encontrado"
                ));

        var servicio = servicioRepositorio.findById(servicioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Servicio no encontrado"
                ));

        cita.setPaciente(paciente);
        cita.setOdontologo(odontologo);
        cita.setServicio(servicio);
        cita.setFechaHora(fechaHora);
        cita.setObservaciones(observaciones);

        return citaRepositorio.save(cita);
    }

    // PATCH: cambiar el estado de la cita
    @Transactional
    public Cita cambiarEstado(Long id, String nuevoEstado) {

        Cita cita = buscarPorId(id);

        // Comprobar estados permitidos
        if (nuevoEstado == null ||
                !List.of(
                        "PENDIENTE",
                        "CONFIRMADA",
                        "ATENDIDA",
                        "CANCELADA"
                ).contains(nuevoEstado)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Estado de cita no valido"
            );
        }

        if (cita.getEstado().equals(nuevoEstado)) {
            return cita;
        }

        // Evitar reactivar citas finalizadas
        if ("CANCELADA".equals(cita.getEstado()) ||
                "ATENDIDA".equals(cita.getEstado())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La cita ya esta finalizada"
            );
        }

        // No confirmar una cita que ya paso
        if ("CONFIRMADA".equals(nuevoEstado) &&
                cita.getFechaHora().isBefore(LocalDateTime.now())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se puede confirmar una cita pasada"
            );
        }

        // No marcar como atendida una cita futura
        if ("ATENDIDA".equals(nuevoEstado) &&
                cita.getFechaHora().isAfter(LocalDateTime.now())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La cita todavia no ha ocurrido"
            );
        }

        // Al cancelar una cita, comprobar su pago
        if ("CANCELADA".equals(nuevoEstado)) {

            Pago pago = pagoRepositorio.findByCitaId(id).orElse(null);

            if (pago != null) {

                if ("PAGADO".equals(pago.getEstado())) {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "La cita esta pagada y requiere gestion del pago"
                    );
                }

                // Cancelar automaticamente el pago pendiente
                if ("PENDIENTE".equals(pago.getEstado())) {
                    pago.setEstado("CANCELADO");
                    pagoRepositorio.save(pago);
                }
            }
        }

        cita.setEstado(nuevoEstado);

        return citaRepositorio.save(cita);
    }

    // DELETE: eliminar una cita
    @Transactional
    public void eliminar(Long id) {

        Cita cita = buscarPorId(id);

        // Proteger el registro si tiene un pago asociado
        if (pagoRepositorio.existsByCitaId(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La cita tiene un registro de pago asociado"
            );
        }

        citaRepositorio.delete(cita);
        citaRepositorio.flush();
    }
}