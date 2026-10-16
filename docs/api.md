# API REST — RutaControl

Base: `http://localhost:3000/api`  
Formato: `application/json`  
Autenticación: `Authorization: Bearer <token>` (todas excepto `POST /auth/login` y `GET /health`).

## Endpoints

| Método | Ruta | Acción | Rol permitido |
| --- | --- | --- | --- |
| GET | `/health` | Probar conexión con PostgreSQL | Público |
| POST | `/auth/login` | Validar correo y contraseña; emitir JWT | Público |
| GET | `/auth/me` | Consultar sesión | admin / operador |
| GET | `/resumen` | Resumen y próximos viajes | admin / operador |
| GET | `/vehiculos`, `/conductores`, `/rutas` | Listar registros | admin / operador |
| GET | `/vehiculos/:id`, `/conductores/:id`, `/rutas/:id` | Obtener registro | admin / operador |
| POST | `/vehiculos`, `/conductores`, `/rutas` | Crear registro | admin |
| PUT | `/vehiculos/:id`, `/conductores/:id`, `/rutas/:id` | Actualizar registro | admin |
| DELETE | `/vehiculos/:id`, `/conductores/:id`, `/rutas/:id` | Eliminar registro | admin |
| GET | `/viajes`, `/viajes/:id` | Consultar viajes | admin / operador |
| POST | `/viajes` | Programar viaje | admin / operador |
| PUT | `/viajes/:id` | Actualizar viaje | admin / operador |
| DELETE | `/viajes/:id` | Eliminar viaje | admin |
| GET | `/usuarios`, `/usuarios/:id` | Consultar usuarios sin hashes | admin |
| POST | `/usuarios` | Crear usuario | admin |
| PUT | `/usuarios/:id` | Editar usuario; contraseña opcional | admin |
| DELETE | `/usuarios/:id` | Eliminar usuario | admin |

## Ejemplo de sesión

**POST `/api/auth/login`**

```json
{"correo":"admin@transporte.local","password":"LA_CLAVE_CONFIGURADA_EN_ENV"}
```

Respuesta `200`:

```json
{"token":"<jwt>","usuario":{"id_usuario":1,"nombre":"Administrador Transporte","correo":"admin@transporte.local","rol":"admin"}}
```

## Ejemplos de solicitudes CRUD

**POST `/api/vehiculos`**

```json
{"placa":"ABC-7777","marca":"Hino","modelo":"FC9J","capacidad":38,"estado":"activo"}
```

**POST `/api/conductores`**

```json
{"nombres":"Carlos Andrade","licencia":"LIC-7474","telefono":"0987654321","estado":"activo"}
```

**POST `/api/rutas`**

```json
{"origen":"Cuenca","destino":"Azogues","distancia_km":34.00,"estado":"activo"}
```

**POST `/api/viajes`** (los IDs deben existir)

```json
{
  "id_vehiculo":1,
  "id_conductor":1,
  "id_ruta":1,
  "fecha_salida":"2027-03-10T13:00:00.000Z",
  "fecha_llegada_prevista":"2027-03-10T15:00:00.000Z",
  "estado":"programado",
  "observaciones":"Servicio Cuenca–Azogues"
}
```

El campo `id_usuario` se completa en backend desde la sesión, para impedir suplantación.

**POST `/api/usuarios`**

```json
{"nombre":"Operador Uno","correo":"operador@example.com","password":"UnaClaveSegura123!","rol":"operador","activo":true}
```

Para `PUT /api/usuarios/:id`, enviar nombre, correo, rol, activo y opcionalmente `password`. Si se omite, mantiene la contraseña anterior.

## Códigos HTTP

- `200`: consulta/actualización/eliminación realizada.
- `201`: recurso creado.
- `400`: entrada inválida (tipos, fechas, requisitos).
- `401`: falta de sesión o credenciales incorrectas.
- `403`: el usuario no tiene permisos.
- `404`: ID o endpoint inexistente.
- `409`: datos únicos repetidos, recurso vinculado por FK o viaje superpuesto.
- `429`: límite de intentos de login.
- `500`: error interno; consultar terminal.

## Seguridad y decisiones de implementación

- Contraseñas persistidas con bcrypt (costo 12), nunca en texto plano ni en respuestas JSON.
- JWT expira en 4 horas y usa HS256 y secreto del entorno.
- La API verifica usuario activo y rol contra base de datos por petición.
- Las consultas a PostgreSQL usan valores `$1`, `$2`…; los nombres de tablas y columnas del CRUD genérico son constantes internas.
- En creación/actualización de viajes se adquieren bloqueos transaccionales sobre conductor y vehículo, seguidos de una consulta de superposición.
- Claves foráneas con `ON DELETE RESTRICT` evitan eliminar entidades que conservaron viajes.
- El frontend no expone sentencias SQL ni credenciales de PostgreSQL; únicamente consume el backend.
