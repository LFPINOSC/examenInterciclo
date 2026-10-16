package com.danny.reservas.model;

public record Actor(long id, String nombre, String email, String rol, int version) {
  public boolean admin() {
    return "ADMIN".equals(rol);
  }
}
