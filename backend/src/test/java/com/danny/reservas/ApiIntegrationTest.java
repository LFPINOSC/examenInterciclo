package com.danny.reservas;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.*;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiIntegrationTest {
  @Autowired MockMvc mvc;
  @Autowired ObjectMapper json;
  @Autowired JdbcTemplate db;
  String admin, user, email;

  @BeforeEach
  void setup() throws Exception {
    email = "u" + UUID.randomUUID() + "@test.local";
    call(
        "POST",
        "/api/auth/registro",
        null,
        Map.of("nombre", "Huésped", "email", email, "password", "UsuarioTest123!"),
        201);
    user = login(email, "UsuarioTest123!");
    admin = login("admin@test.local", "AdminTest123!");
  }

  JsonNode call(String method, String path, String token, Object body, int status)
      throws Exception {
    var r =
        switch (method) {
          case "POST" -> post(path);
          case "PUT" -> put(path);
          case "PATCH" -> patch(path);
          case "DELETE" -> delete(path);
          default -> get(path);
        };
    if (token != null) r.header("Authorization", "Bearer " + token);
    if (body != null) r.contentType("application/json").content(json.writeValueAsString(body));
    String out =
        mvc.perform(r)
            .andExpect(status().is(status))
            .andReturn()
            .getResponse()
            .getContentAsString();
    return out.isBlank() ? json.nullNode() : json.readTree(out);
  }

  String login(String email, String pwd) throws Exception {
    return call("POST", "/api/auth/login", null, Map.of("email", email, "password", pwd), 200)
        .get("token")
        .asText();
  }

  long room() throws Exception {
    long h = db.queryForObject("SELECT MIN(id) FROM hoteles", Long.class),
        t = db.queryForObject("SELECT MIN(id) FROM tipos_habitacion", Long.class);
    return call(
            "POST",
            "/api/habitaciones",
            admin,
            Map.of(
                "hotelId",
                h,
                "tipoId",
                t,
                "numero",
                UUID.randomUUID().toString().substring(0, 8),
                "precioNoche",
                40,
                "capacidad",
                2,
                "activa",
                true),
            201)
        .get("id")
        .asLong();
  }

  Map<String, Object> reserva(long h, int start, int end, int people) {
    return Map.of(
        "habitacionId",
        h,
        "entrada",
        LocalDate.now().plusDays(start).toString(),
        "salida",
        LocalDate.now().plusDays(end).toString(),
        "huespedes",
        people);
  }

  @Test
  void registroYSeguridad() throws Exception {
    call(
        "POST",
        "/api/auth/registro",
        null,
        Map.of("nombre", "Otro", "email", email, "password", "UsuarioTest123!"),
        409);
    call("POST", "/api/auth/login", null, Map.of("email", email, "password", "incorrecta"), 401);
    call("GET", "/api/habitaciones", null, null, 401);
    call("GET", "/api/usuarios", user, null, 403);
    call(
        "POST",
        "/api/hoteles",
        user,
        Map.of("nombre", "X", "ciudad", "C", "direccion", "D", "descripcion", ""),
        403);
  }

  @Test
  void validacionDatos() throws Exception {
    call(
        "POST",
        "/api/auth/registro",
        null,
        Map.of("nombre", "", "email", "mal", "password", "x"),
        400);
    call(
        "POST",
        "/api/habitaciones",
        admin,
        Map.of(
            "hotelId",
            1,
            "tipoId",
            1,
            "numero",
            "",
            "precioNoche",
            -3,
            "capacidad",
            0,
            "activa",
            true),
        400);
  }

  @Test
  void crudCatalogos() throws Exception {
    var h =
        call(
            "POST",
            "/api/hoteles",
            admin,
            Map.of(
                "nombre", "Prueba", "ciudad", "Tena", "direccion", "Centro", "descripcion", "Test"),
            201);
    long id = h.get("id").asLong();
    call("GET", "/api/hoteles/" + id, user, null, 200);
    call(
        "PUT",
        "/api/hoteles/" + id,
        admin,
        Map.of(
            "nombre", "Actualizado", "ciudad", "Cuenca", "direccion", "Centro", "descripcion", ""),
        200);
    call("DELETE", "/api/hoteles/" + id, admin, null, 204);
    call("GET", "/api/hoteles/" + id, admin, null, 404);
    var t =
        call(
            "POST",
            "/api/tipos",
            admin,
            Map.of("nombre", "Tipo-" + UUID.randomUUID(), "descripcion", "Test"),
            201);
    long tid = t.get("id").asLong();
    call(
        "PUT",
        "/api/tipos/" + tid,
        admin,
        Map.of("nombre", "Editado-" + UUID.randomUUID(), "descripcion", "Cambio"),
        200);
    call("DELETE", "/api/tipos/" + tid, admin, null, 204);
  }

  @Test
  void crudHabitacion() throws Exception {
    long id = room();
    var r = call("GET", "/api/habitaciones/" + id, user, null, 200);
    assertTrue(r.has("hotelId"));
    call(
        "PUT",
        "/api/habitaciones/" + id,
        admin,
        Map.of(
            "hotelId",
            r.get("hotelId").asLong(),
            "tipoId",
            r.get("tipoId").asLong(),
            "numero",
            r.get("numero").asText(),
            "precioNoche",
            55,
            "capacidad",
            3,
            "activa",
            false),
        200);
    call("POST", "/api/reservas", user, reserva(id, 2, 4, 1), 409);
    call("DELETE", "/api/habitaciones/" + id, admin, null, 204);
  }

  @Test
  void crudReservaYTotal() throws Exception {
    long h = room();
    var r = call("POST", "/api/reservas", user, reserva(h, 3, 5, 2), 201);
    assertEquals(80, r.get("total").asInt());
    long id = r.get("id").asLong();
    call("PUT", "/api/reservas/" + id, user, reserva(h, 3, 6, 2), 200);
    call("DELETE", "/api/reservas/" + id, user, null, 409);
    call("DELETE", "/api/habitaciones/" + h, admin, null, 409);
    call("PATCH", "/api/reservas/" + id + "/cancelar", user, null, 204);
    call("DELETE", "/api/reservas/" + id, user, null, 204);
    call("GET", "/api/reservas/" + id, user, null, 404);
  }

  @Test
  void fechasCapacidadSolapamiento() throws Exception {
    long h = room();
    call("POST", "/api/reservas", user, reserva(h, -1, 2, 1), 400);
    call("POST", "/api/reservas", user, reserva(h, 2, 2, 1), 400);
    call("POST", "/api/reservas", user, reserva(h, 2, 4, 3), 400);
    call("POST", "/api/reservas", user, reserva(h, 2, 4, 2), 201);
    call("POST", "/api/reservas", user, reserva(h, 3, 5, 1), 409);
    call("POST", "/api/reservas", user, reserva(h, 4, 5, 1), 201);
    var available =
        call(
            "GET",
            "/api/habitaciones?entrada="
                + LocalDate.now().plusDays(2)
                + "&salida="
                + LocalDate.now().plusDays(4)
                + "&huespedes=1",
            user,
            null,
            200);
    for (var r : available) assertNotEquals(h, r.get("id").asLong());
  }

  @Test
  void propiedadReserva() throws Exception {
    long h = room();
    long id = call("POST", "/api/reservas", admin, reserva(h, 10, 12, 1), 201).get("id").asLong();
    call("GET", "/api/reservas/" + id, user, null, 403);
    call("PUT", "/api/reservas/" + id, user, reserva(h, 11, 13, 1), 403);
    call("PATCH", "/api/reservas/" + id + "/cancelar", user, null, 403);
    call("DELETE", "/api/reservas/" + id, user, null, 403);
  }

  @Test
  void revocacionBloqueoYLogout() throws Exception {
    long id = call("GET", "/api/auth/me", user, null, 200).get("id").asLong();
    call("PATCH", "/api/usuarios/" + id + "/activo", admin, Map.of("activo", false), 204);
    call("GET", "/api/auth/me", user, null, 401);
    call(
        "POST",
        "/api/auth/login",
        null,
        Map.of("email", email, "password", "UsuarioTest123!"),
        403);
    call("PATCH", "/api/usuarios/" + id + "/activo", admin, Map.of("activo", true), 204);
    user = login(email, "UsuarioTest123!");
    call("POST", "/api/auth/logout", user, null, 204);
    call("GET", "/api/auth/me", user, null, 401);
  }

  @Test
  void tokenFalsificado() throws Exception {
    call("GET", "/api/auth/me", "abc.def.ghi", null, 401);
  }

  @Test
  void concurrenciaNoDuplica() throws Exception {
    long h = room();
    var body = json.writeValueAsString(reserva(h, 20, 23, 1));
    ExecutorService pool = Executors.newFixedThreadPool(2);
    var start = new CountDownLatch(1);
    Callable<Integer> req =
        () -> {
          start.await();
          return mvc.perform(
                  post("/api/reservas")
                      .header("Authorization", "Bearer " + user)
                      .contentType("application/json")
                      .content(body))
              .andReturn()
              .getResponse()
              .getStatus();
        };
    var a = pool.submit(req);
    var b = pool.submit(req);
    start.countDown();
    var codes = new ArrayList<>(List.of(a.get(20, TimeUnit.SECONDS), b.get(20, TimeUnit.SECONDS)));
    Collections.sort(codes);
    pool.shutdown();
    assertEquals(List.of(201, 409), codes);
  }
}
