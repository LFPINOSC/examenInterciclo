package com.danny.reservas.config;

import com.danny.reservas.repository.Consultas;
import com.danny.reservas.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class Semilla implements CommandLineRunner {
  private final Consultas db;
  private final AuthService auth;
  private final String email, password;

  public Semilla(
      Consultas db,
      AuthService auth,
      @Value("${app.admin-email}") String email,
      @Value("${app.admin-password}") String password) {
    this.db = db;
    this.auth = auth;
    this.email = email;
    this.password = password;
  }

  @Override
  @Transactional
  public void run(String... args) {
    if (db.jdbc().queryForObject("SELECT COUNT(*) FROM usuarios WHERE rol='ADMIN'", Integer.class)
        == 0) {
      if (password.length() < 10
          || password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72)
        throw new IllegalStateException("Configura la contraseña ADMIN (10-72 bytes)");
      db.insertar(
          "INSERT INTO usuarios(nombre,email,password_hash,rol) VALUES(?,?,?,?)",
          "Administrador",
          email.trim().toLowerCase(java.util.Locale.ROOT),
          auth.hash.encode(password),
          "ADMIN");
    }
    // Solo se carga el catálogo cuando nunca se creó ninguno (marca persistente).

    if (db.jdbc()
            .queryForObject(
                "SELECT COUNT(*) FROM inicializacion WHERE clave='catalogo-v1'", Integer.class)
        == 0) {
      long h1 =
          db.insertar(
              "INSERT INTO hoteles(nombre,ciudad,direccion,descripcion) VALUES(?,?,?,?)",
              "Hotel Río Tomebamba",
              "Cuenca",
              "Av. 12 de Abril 123",
              "Una estancia tranquila junto al río, cerca del centro histórico.");
      long h2 =
          db.insertar(
              "INSERT INTO hoteles(nombre,ciudad,direccion,descripcion) VALUES(?,?,?,?)",
              "Hostería Bosque Amazónico",
              "Tena",
              "Vía al Pano km 2",
              "Habitaciones amplias para descansar y conocer la Amazonía.");
      long t1 =
          db.insertar(
              "INSERT INTO tipos_habitacion(nombre,descripcion) VALUES(?,?)",
              "Individual",
              "Una cama y espacio para una persona.");
      long t2 =
          db.insertar(
              "INSERT INTO tipos_habitacion(nombre,descripcion) VALUES(?,?)",
              "Doble",
              "Alojamiento para dos personas.");
      long t3 =
          db.insertar(
              "INSERT INTO tipos_habitacion(nombre,descripcion) VALUES(?,?)",
              "Familiar",
              "Espacio para compartir en familia.");
      db.jdbc()
          .update(
              "INSERT INTO habitaciones(hotel_id,tipo_id,numero,precio_noche,capacidad)"
                  + " VALUES(?,?,?,?,?)",
              h1,
              t1,
              "101",
              35,
              1);
      db.jdbc()
          .update(
              "INSERT INTO habitaciones(hotel_id,tipo_id,numero,precio_noche,capacidad)"
                  + " VALUES(?,?,?,?,?)",
              h1,
              t2,
              "102",
              55,
              2);
      db.jdbc()
          .update(
              "INSERT INTO habitaciones(hotel_id,tipo_id,numero,precio_noche,capacidad)"
                  + " VALUES(?,?,?,?,?)",
              h1,
              t3,
              "201",
              90,
              4);
      db.jdbc()
          .update(
              "INSERT INTO habitaciones(hotel_id,tipo_id,numero,precio_noche,capacidad)"
                  + " VALUES(?,?,?,?,?)",
              h2,
              t2,
              "A1",
              45,
              2);
      db.jdbc()
          .update(
              "INSERT INTO habitaciones(hotel_id,tipo_id,numero,precio_noche,capacidad)"
                  + " VALUES(?,?,?,?,?)",
              h2,
              t3,
              "A2",
              80,
              5);
      db.jdbc().update("INSERT INTO inicializacion(clave) VALUES('catalogo-v1')");
    }
  }
}
