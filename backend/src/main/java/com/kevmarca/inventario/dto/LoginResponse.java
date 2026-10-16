package com.kevmarca.inventario.dto;

// 📌 Lo que devuelve el login: el token + datos para mostrar en pantalla
public record LoginResponse(String token, String username, String nombre, String rol) {}
