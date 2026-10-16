package com.danny.reservas.repository;

import com.danny.reservas.exception.ApiException;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.*;
import org.springframework.stereotype.Repository;

@Repository
public class Consultas {
  private final JdbcTemplate jdbc;

  public JdbcTemplate jdbc() {
    return jdbc;
  }

  public Consultas(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public Map<String, Object> uno(String sql, Object... args) {
    var rows = jdbc.queryForList(sql, args);
    if (rows.isEmpty()) throw new ApiException(404, "Registro no encontrado");
    return rows.get(0);
  }

  public long insertar(String sql, Object... args) {
    KeyHolder keys = new GeneratedKeyHolder();
    jdbc.update(
        c -> {
          var p = c.prepareStatement(sql, java.sql.Statement.RETURN_GENERATED_KEYS);
          for (int i = 0; i < args.length; i++) p.setObject(i + 1, args[i]);
          return p;
        },
        keys);
    return keys.getKey().longValue();
  }

  public void borrar(String tabla, long id) {
    if (jdbc.update("DELETE FROM " + tabla + " WHERE id=?", id) == 0)
      throw new ApiException(404, "Registro no encontrado");
  }

  public static long numero(Map<String, Object> m, String key) {
    return ((Number) m.get(key)).longValue();
  }

  public static boolean bool(Map<String, Object> m, String key) {
    Object v = m.get(key);
    return v instanceof Boolean b ? b : ((Number) v).intValue() != 0;
  }
}
