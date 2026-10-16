# Plan de pruebas

## Pruebas funcionales mínimas para demostrar

| # | Prueba | Resultado esperado |
|---|---|---|
| 1 | Login con `admin / Admin123*` | HTTP 200 y JWT |
| 2 | Login con contraseña incorrecta | HTTP 401 |
| 3 | Registrar nuevo lector | Usuario creado con rol LECTOR |
| 4 | Crear autor como ADMIN | HTTP 201 y aparece en tabla |
| 5 | Crear categoría como ADMIN | HTTP 201 |
| 6 | Crear libro con ISBN repetido | HTTP 400 |
| 7 | Crear libro válido | Se persiste en PostgreSQL |
| 8 | Buscar libro por título | Solo aparecen coincidencias |
| 9 | Prestar libro disponible | Disponibles disminuye en 1 |
| 10 | Prestar sin disponibilidad | HTTP 400 |
| 11 | Devolver préstamo | Estado DEVUELTO y disponibles aumenta en 1 |
| 12 | Entrar como LECTOR | No aparece gestión de usuarios ni botones administrativos |
| 13 | LECTOR intenta POST `/books` manualmente | HTTP 403 |
| 14 | Recargar Angular con sesión iniciada | La sesión se recupera desde localStorage |
| 15 | Frontend sin backend | Se evidencia fallo de conexión; no utiliza datos simulados |

## Prueba directa con curl

```bash
curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"Admin123*"}'
```

Copiar el `token` recibido:

```bash
TOKEN='PEGAR_TOKEN'
curl -s http://localhost:8080/api/books \
  -H "Authorization: Bearer $TOKEN"
```

## Evidencias recomendadas

1. Base de datos creada en PostgreSQL.
2. Backend iniciando en puerto 8080.
3. Login exitoso.
4. CRUD de un autor o categoría.
5. CRUD de un libro.
6. Registro de préstamo mostrando cambio de disponibilidad.
7. Devolución mostrando actualización.
8. Intento de acceso con rol LECTOR a una función administrativa.
9. Tabla `prestamos` consultada desde PostgreSQL.
10. Frontend responsivo en una ventana estrecha.
