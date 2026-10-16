package com.danny.reservas.service;

import com.danny.reservas.dto.Datos;
import com.danny.reservas.exception.ApiException;
import com.danny.reservas.repository.Consultas;
import java.time.LocalDate;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogoService {
  private final Consultas db;

  public CatalogoService(Consultas db) {
    this.db = db;
  }

  public List<Map<String, Object>> hoteles() {
    return db.jdbc().queryForList("SELECT * FROM hoteles ORDER BY id");
  }

  public Map<String, Object> hotel(long id) {
    return db.uno("SELECT * FROM hoteles WHERE id=?", id);
  }

  public Object crearHotel(Datos.Hotel d) {
    long id =
        db.insertar(
            "INSERT INTO hoteles(nombre,ciudad,direccion,descripcion) VALUES(?,?,?,?)",
            d.nombre().trim(),
            d.ciudad().trim(),
            d.direccion().trim(),
            d.descripcion().trim());
    return hotel(id);
  }

  public Object editarHotel(long id, Datos.Hotel d) {
    hotel(id);
    db.jdbc()
        .update(
            "UPDATE hoteles SET nombre=?,ciudad=?,direccion=?,descripcion=? WHERE id=?",
            d.nombre().trim(),
            d.ciudad().trim(),
            d.direccion().trim(),
            d.descripcion().trim(),
            id);
    return hotel(id);
  }

  public void borrarHotel(long id) {
    db.borrar("hoteles", id);
  }

  public List<Map<String, Object>> tipos() {
    return db.jdbc().queryForList("SELECT * FROM tipos_habitacion ORDER BY id");
  }

  public Map<String, Object> tipo(long id) {
    return db.uno("SELECT * FROM tipos_habitacion WHERE id=?", id);
  }

  public Object crearTipo(Datos.Tipo d) {
    long id =
        db.insertar(
            "INSERT INTO tipos_habitacion(nombre,descripcion) VALUES(?,?)",
            d.nombre().trim(),
            d.descripcion().trim());
    return tipo(id);
  }

  public Object editarTipo(long id, Datos.Tipo d) {
    tipo(id);
    db.jdbc()
        .update(
            "UPDATE tipos_habitacion SET nombre=?,descripcion=? WHERE id=?",
            d.nombre().trim(),
            d.descripcion().trim(),
            id);
    return tipo(id);
  }

  public void borrarTipo(long id) {
    db.borrar("tipos_habitacion", id);
  }

  public static final String ROOMS =
      "SELECT h.id,h.hotel_id AS hotelId,h.tipo_id AS tipoId,h.numero,h.precio_noche AS"
          + " precioNoche,h.capacidad,h.activa,o.nombre AS hotel,o.ciudad,t.nombre AS tipo FROM"
          + " habitaciones h JOIN hoteles o ON o.id=h.hotel_id JOIN tipos_habitacion t ON"
          + " t.id=h.tipo_id";

  public List<Map<String, Object>> habitaciones(
      LocalDate entrada, LocalDate salida, Integer huespedes) {
    String sql = ROOMS;
    List<Object> a = new ArrayList<>();
    if (entrada != null || salida != null) {
      if (entrada == null
          || salida == null
          || !salida.isAfter(entrada)
          || entrada.isBefore(LocalDate.now()))
        throw new ApiException(
            400, "Indica fechas válidas: salida posterior a entrada, sin fechas pasadas");
      sql +=
          " WHERE h.activa=TRUE AND NOT EXISTS (SELECT 1 FROM reservas r WHERE r.habitacion_id=h.id"
              + " AND r.estado='CONFIRMADA' AND r.entrada<? AND r.salida>?)";
      a.add(salida);
      a.add(entrada);
      if (huespedes != null) {
        if (huespedes < 1 || huespedes > 20) throw new ApiException(400, "Huéspedes entre 1 y 20");
        sql += " AND h.capacidad>=?";
        a.add(huespedes);
      }
    }
    return db.jdbc().queryForList(sql + " ORDER BY h.id", a.toArray());
  }

  public Map<String, Object> habitacion(long id) {
    return db.uno(ROOMS + " WHERE h.id=?", id);
  }

  public Object crearHabitacion(Datos.Habitacion d) {
    hotel(d.hotelId());
    tipo(d.tipoId());
    long id =
        db.insertar(
            "INSERT INTO habitaciones(hotel_id,tipo_id,numero,precio_noche,capacidad,activa)"
                + " VALUES(?,?,?,?,?,?)",
            d.hotelId(),
            d.tipoId(),
            d.numero().trim(),
            d.precioNoche(),
            d.capacidad(),
            d.activa());
    return habitacion(id);
  }

  @Transactional
  public Object editarHabitacion(long id, Datos.Habitacion d) {
    db.uno("SELECT * FROM habitaciones WHERE id=? FOR UPDATE", id);
    hotel(d.hotelId());
    tipo(d.tipoId());
    Integer incompatible =
        db.jdbc()
            .queryForObject(
                "SELECT COUNT(*) FROM reservas WHERE habitacion_id=? AND estado='CONFIRMADA' AND"
                    + " salida>? AND huespedes>?",
                Integer.class,
                id,
                LocalDate.now(),
                d.capacidad());
    if (incompatible > 0)
      throw new ApiException(
          409, "La capacidad propuesta es menor que los huéspedes de una reserva vigente");
    db.jdbc()
        .update(
            "UPDATE habitaciones SET"
                + " hotel_id=?,tipo_id=?,numero=?,precio_noche=?,capacidad=?,activa=? WHERE id=?",
            d.hotelId(),
            d.tipoId(),
            d.numero().trim(),
            d.precioNoche(),
            d.capacidad(),
            d.activa(),
            id);
    return habitacion(id);
  }

  public void borrarHabitacion(long id) {
    db.borrar("habitaciones", id);
  }
}
