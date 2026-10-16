package com.andres.odontologia_api.repositorio;

import com.andres.odontologia_api.modelo.Pago;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Repositorio para gestionar los pagos
public interface PagoRepositorio extends JpaRepository<Pago, Long> {

    // Buscar el pago que corresponde a una cita
    Optional<Pago> findByCitaId(Long citaId);

    // Verificar si una cita ya tiene un pago registrado
    boolean existsByCitaId(Long citaId);
}