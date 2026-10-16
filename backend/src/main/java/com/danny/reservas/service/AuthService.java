package com.danny.reservas.service;

import com.danny.reservas.dto.Datos;
import com.danny.reservas.exception.ApiException;
import com.danny.reservas.model.Actor;
import com.danny.reservas.repository.Consultas;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
  private final Consultas db;
  public final BCryptPasswordEncoder hash = new BCryptPasswordEncoder(12);

  public AuthService(Consultas db) {
    this.db = db;
  }

  public Map<String, Object> registrar(Datos.Registro d) {
    if (d.password().getBytes(StandardCharsets.UTF_8).length > 72)
      throw new ApiException(400, "La contraseña supera 72 bytes");
    long id =
        db.insertar(
            "INSERT INTO usuarios(nombre,email,password_hash,rol) VALUES(?,?,?,?)",
            d.nombre().trim(),
            d.email().trim().toLowerCase(Locale.ROOT),
            hash.encode(d.password()),
            "USUARIO");
    return Map.of("id", id, "mensaje", "Cuenta creada. Ya puedes iniciar sesión.");
  }

  public Actor login(Datos.Login d) {
    if (d.password().getBytes(StandardCharsets.UTF_8).length > 72)
      throw new ApiException(401, "Credenciales incorrectas");
    var list =
        db.jdbc()
            .queryForList(
                "SELECT * FROM usuarios WHERE email=?", d.email().trim().toLowerCase(Locale.ROOT));
    if (list.isEmpty() || !hash.matches(d.password(), list.get(0).get("password_hash").toString()))
      throw new ApiException(401, "Credenciales incorrectas");
    var u = list.get(0);
    if (!Consultas.bool(u, "activo")) throw new ApiException(403, "Cuenta desactivada");
    return actor(u);
  }

  public Actor actual(long id, int version) {
    var rows = db.jdbc().queryForList("SELECT * FROM usuarios WHERE id=?", id);
    if (rows.isEmpty()) throw new ApiException(401, "Sesión no válida");
    var u = rows.get(0);
    if (!Consultas.bool(u, "activo") || Consultas.numero(u, "token_version") != version)
      throw new ApiException(401, "Sesión revocada");
    return actor(u);
  }

  private Actor actor(Map<String, Object> u) {
    return new Actor(
        Consultas.numero(u, "id"),
        u.get("nombre").toString(),
        u.get("email").toString(),
        u.get("rol").toString(),
        (int) Consultas.numero(u, "token_version"));
  }

  public void logout(Actor a) {
    db.jdbc().update("UPDATE usuarios SET token_version=token_version+1 WHERE id=?", a.id());
  }

  public List<Map<String, Object>> usuarios() {
    return db.jdbc().queryForList("SELECT id,nombre,email,rol,activo FROM usuarios ORDER BY id");
  }

  public void activo(long id, boolean activo, Actor a) {
    if (id == a.id()) throw new ApiException(400, "No puedes desactivar tu propia cuenta");
    var u = db.uno("SELECT * FROM usuarios WHERE id=?", id);
    if ("ADMIN".equals(u.get("rol")))
      throw new ApiException(400, "La cuenta ADMIN inicial se conserva");
    db.jdbc()
        .update(
            "UPDATE usuarios SET activo=?,token_version=token_version+1 WHERE id=?", activo, id);
  }
}
