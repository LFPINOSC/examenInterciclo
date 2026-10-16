# TecnoSoporte – Backend API REST – Estudiante 21 (Alex Tenelema)

**Stack**: Java 25, Maven 3.9+, Spring Boot 4.1.1, PostgreSQL 18.6, Spring Security, JWT, JPA, Validations, OpenAPI.

## 1. Importante

Este paquete contiene **solo el backend** más archivos SQL y el diagrama. No incluye Angular.
Las cuentas permitidas son `ADMIN` y `CLIENTE`. Los técnicos son registros de empleados, sin acceso a la aplicación.
No utiliza correo electrónico.

## 2. Creación de la base

En pgAdmin, conectado a la base `postgres`, ejecuta:

```sql
CREATE DATABASE soporte_tecnico_db;
```

La API crea/actualiza las tablas mediante JPA (`ddl-auto=update`). El archivo
`base-datos/crear_tablas.sql` muestra el modelo SQL académico: **no es necesario ejecutarlo** si dejas que Hibernate cree el esquema. No mezcles ambos métodos en una base ya poblada sin verificar diferencias.

## 3. Iniciar en Windows – recomendado

Abre PowerShell dentro de `backend-springboot` y ejecuta:

```powershell
powershell -ExecutionPolicy Bypass -File .\INICIAR_BACKEND.ps1
```

El script preguntará la contraseña de PostgreSQL y solicitará crear contraseñas para ADMIN y clientes de prueba. Las contraseñas **no se escriben en archivos**. Además generará una clave JWT aleatoria para esa sesión.

Luego utiliza:

- Swagger: http://localhost:8080/swagger-ui.html
- API: http://localhost:8080/api

> Si hay un error `Port 8080 already in use`, libera el puerto o define `$env:SERVER_PORT=8081` antes de ejecutar el script.

## 4. Usuarios de prueba

- ADMIN: `admin@tecnosoporte.local` — contraseña introducida en el inicio.
- CLIENTE 1: `ana.cliente@demo.local` — contraseña de clientes de prueba introducida en el inicio.
- CLIENTE 2: `juan.cliente@demo.local` — misma contraseña de prueba.

Semilla idempotente: 3 técnicos, 5 servicios, 3 equipos, 2 tickets y sus detalles. Los usuarios de prueba solo se crean si se configura `DEMO_CLIENT_PASSWORD`.
La creación de datos existentes **no se repite** al reiniciar la API; no se sobreescriben contraseñas anteriores.
Si cambias una contraseña en el script y la cuenta ya existe, la contraseña original sigue vigente en BD.

## 5. Guía rápida de prueba desde Swagger

1. `POST /api/auth/login` con JSON: `{"correo":"admin@tecnosoporte.local","contrasena":"(tu clave)"}`
2. Copia el `token` de respuesta.
3. Pulsa `Authorize` (candado) y pega solo el token JWT; en Swagger Bearer no es necesario anteponer `Bearer`.
4. Prueba `GET /api/usuarios`, `GET /api/tecnicos`, `GET /api/equipos`, `GET /api/tickets` y `GET /api/servicios`.
5. Añade un técnico con `POST /api/tecnicos`, asigna un ticket y agrega múltiples servicios desde un array.
6. Inicia sesión como cliente y verifica que `/api/usuarios` devuelve 403 y que `/api/tickets` solo muestra los suyos.

### Ejemplos

Crear ticket (CLIENTE o ADMIN):

```json
{"equipoId":1,"descripcionProblema":"El equipo se apaga a los pocos minutos","prioridad":"MEDIA"}
```

Asignar técnico (ADMIN): `PUT /api/tickets/{id}/asignar`

```json
{"tecnicoId":1}
```

Servicios en un ticket ASIGNADO o EN_PROCESO (ADMIN): `PUT /api/tickets/{id}/servicios`

```json
{"servicios":[
  {"servicioId":1,"observacion":"Inspeccion del equipo"},
  {"servicioId":2,"observacion":"Limpieza de componentes"}
]}
```

> Esta operación **reemplaza** la lista completa de servicios del ticket en una transacción. El precio aplicado se guarda para preservar el historial.

Estado (ADMIN): `PUT /api/tickets/{id}/estado`

```json
{"estado":"EN_PROCESO","diagnostico":"Ventilador sucio"}
```

Para RESUELTO se exige diagnóstico y solución. Flujo: PENDIENTE → ASIGNADO (mediante `/asignar`) → EN_PROCESO → RESUELTO → CERRADO.

## 6. Endpoints

| Modulo | Rutas |
|---|---|
| Auth | POST `/api/auth/registro`, POST `/api/auth/login` |
| Usuario | GET `/api/usuarios/me`; ADMIN: GET `/api/usuarios`, GET/PUT/DELETE `/api/usuarios/{id}` |
| Tecnicos (ADMIN) | GET/POST `/api/tecnicos`, GET/PUT/DELETE `/api/tecnicos/{id}` |
| Equipos | GET/POST `/api/equipos`, GET/PUT/DELETE `/api/equipos/{id}` |
| Servicios | GET `/api/servicios`, GET `/api/servicios/{id}`; ADMIN: POST/PUT/DELETE |
| Tickets | GET/POST `/api/tickets`, GET/PUT/DELETE `/api/tickets/{id}`; ADMIN: PUT `/{id}/asignar`, PUT `/{id}/estado`, PUT `/{id}/servicios` |

`DELETE` de usuario, técnico, equipo o servicio desactiva el registro para conservar relaciones históricas. `DELETE` de ticket solo borra solicitudes PENDIENTES sin técnico ni servicios.

## 7. Seguridad y errores

- Contraseñas codificadas con BCrypt; JWT de 2 horas.
- Registro público crea exclusivamente rol CLIENTE.
- Restricciones ADMIN en endpoints administrativos y verificaciones de propiedad en tickets/equipos.
- 400 validación, 401 sin token, 403 sin permiso, 404 inexistente, 409 duplicados/reglas de negocio.
- No se devuelven contraseñas ni hashes en el JSON.
- Para demo local, CORS acepta Angular en `localhost:4200` y `127.0.0.1:4200`.

## 8. Evidencias y GitHub

Archivos SQL: `base-datos/`. Diagrama Mermaid: `diagramas/relaciones.mmd`.
Para copiar el backend a tu rama Git `estudiante-21-alex-tenelema`, **extrae el ZIP y copia las carpetas `backend-springboot`, `base-datos` y `diagramas` dentro de `examenInterciclo`**, sin tocar `.git`. Luego:

```powershell
git add .
git commit -m "Backend TecnoSoporte estudiante 21"
git push -u origin estudiante-21-alex-tenelema
```

Si el remoto devuelve `403`, tu profesor tiene que autorizar la cuenta GitHub conectada. No puede resolverse desde este ZIP.

## 9. Nota de verificación

El proyecto tiene fuentes y pruebas unitarias simples, pero debe compilarse y probarse **en tu equipo con PostgreSQL** antes de entregarlo. Nunca presupongas que los endpoints funcionan sin ejecutarlos y validar las respuestas. Comandos:

```powershell
mvn clean test
mvn spring-boot:run
```
