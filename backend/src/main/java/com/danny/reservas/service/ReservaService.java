package com.danny.reservas.service;

import com.danny.reservas.dto.Datos;
import com.danny.reservas.exception.ApiException;
import com.danny.reservas.model.Actor;
import com.danny.reservas.repository.Consultas;
import java.math.BigDecimal;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReservaService {
  private final Consultas db;

  public ReservaService(Consultas db) {
    this.db = db;
  }

  private static final String SELECT =
      "SELECT r.id,r.usuario_id AS usuarioId,r.habitacion_id AS"
          + " habitacionId,r.entrada,r.salida,r.huespedes,r.precio_noche AS"
          + " precioNoche,r.total,r.estado,u.nombre AS usuario,u.email,h.numero,o.nombre AS hotel"
          + " FROM reservas r JOIN usuarios u ON u.id=r.usuario_id JOIN habitaciones h ON"
          + " h.id=r.habitacion_id JOIN hoteles o ON o.id=h.hotel_id";

  public Object lista(Actor a) {
    return a.admin()
        ? db.jdbc().queryForList(SELECT + " ORDER BY r.id DESC")
        : db.jdbc().queryForList(SELECT + " WHERE r.usuario_id=? ORDER BY r.id DESC", a.id());
  }

  public Map<String, Object> uno(long id, Actor a) {
    var r = db.uno(SELECT + " WHERE r.id=?", id);
    permiso(r, a);
    return r;
  }

  private void permiso(Map<String, Object> r, Actor a) {
    if (!a.admin() && Consultas.numero(r, "usuarioId") != a.id())
      throw new ApiException(403, "Esta reserva pertenece a otro usuario");
  }

  private BigDecimal validar(Datos.Reserva d, long excluir) {
    if (d.entrada().isBefore(LocalDate.now()) || !d.salida().isAfter(d.entrada()))
      throw new ApiException(400, "La entrada no puede ser pasada y la salida debe ser posterior");
    long noches = ChronoUnit.DAYS.between(d.entrada(), d.salida());
    if (noches > 365) throw new ApiException(400, "La estancia máxima es de 365 noches");
    // El bloqueo por habitación serializa las reservas concurrentes de la misma habitación.
    var h = db.uno("SELECT * FROM habitaciones WHERE id=? FOR UPDATE", d.habitacionId());
    if (!Consultas.bool(h, "activa")) throw new ApiException(409, "Habitación fuera de servicio");
    if (d.huespedes() > Consultas.numero(h, "capacidad"))
      throw new ApiException(400, "Se supera la capacidad de la habitación");
    // Intervalos [entrada,salida): permite otra entrada el mismo día de una salida.
    Integer count =
        db.jdbc()
            .queryForObject(
                "SELECT COUNT(*) FROM reservas WHERE habitacion_id=? AND estado='CONFIRMADA' AND"
                    + " id<>? AND entrada<? AND salida>?",
                Integer.class,
                d.habitacionId(),
                excluir,
                d.salida(),
                d.entrada());
    if (count > 0) throw new ApiException(409, "Habitación no disponible en esas fechas");
    return (BigDecimal) h.get("precio_noche");
  }

  @Transactional(isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
  public Object crear(Datos.Reserva d, Actor a) {
    BigDecimal precio = validar(d, 0);
    BigDecimal total =
        precio.multiply(BigDecimal.valueOf(ChronoUnit.DAYS.between(d.entrada(), d.salida())));
    long id =
        db.insertar(
            "INSERT INTO"
                + " reservas(usuario_id,habitacion_id,entrada,salida,huespedes,precio_noche,total,estado)"
                + " VALUES(?,?,?,?,?,?,?,?)",
            a.id(),
            d.habitacionId(),
            d.entrada(),
            d.salida(),
            d.huespedes(),
            precio,
            total,
            "CONFIRMADA");
    return uno(id, a);
  }

  @Transactional(isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
  public Object editar(long id, Datos.Reserva d, Actor a) {
    var r = uno(id, a);
    if (!"CONFIRMADA".equals(r.get("estado")))
      throw new ApiException(409, "Una reserva cancelada no se modifica");
    if (LocalDate.parse(r.get("entrada").toString()).isBefore(LocalDate.now()))
      throw new ApiException(409, "No se modifican reservas ya iniciadas");
    if (Consultas.numero(r, "habitacionId") != d.habitacionId())
      throw new ApiException(400, "Para cambiar de habitación cancela y crea otra reserva");
    BigDecimal precio = validar(d, id);
    int n =
        db.jdbc()
            .update(
                "UPDATE reservas SET entrada=?,salida=?,huespedes=?,precio_noche=?,total=? WHERE"
                    + " id=? AND estado='CONFIRMADA'",
                d.entrada(),
                d.salida(),
                d.huespedes(),
                precio,
                precio.multiply(
                    BigDecimal.valueOf(ChronoUnit.DAYS.between(d.entrada(), d.salida()))),
                id);
    if (n == 0) throw new ApiException(409, "La reserva cambió; actualiza la pantalla");
    return uno(id, a);
  }

  @Transactional(isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
  public void cancelar(long id, Actor a) {
    var r = uno(id, a);
    if (!a.admin() && LocalDate.parse(r.get("entrada").toString()).isBefore(LocalDate.now()))
      throw new ApiException(409, "Contacta al administrador para reservas ya iniciadas");
    db.uno(
        "SELECT id FROM habitaciones WHERE id=? FOR UPDATE", Consultas.numero(r, "habitacionId"));
    db.jdbc().update("UPDATE reservas SET estado='CANCELADA' WHERE id=?", id);
  }

  @Transactional(isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
  public void borrar(long id, Actor a) {
    var r = uno(id, a);
    if (!"CANCELADA".equals(r.get("estado")))
      throw new ApiException(409, "Primero cancela la reserva para eliminarla");
    db.borrar("reservas", id);
  }
}
