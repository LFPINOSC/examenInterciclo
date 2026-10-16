# Examen interciclo — Gestión de biblioteca

**Estudiante:** Braddley Andrés Estrella Salinas  
**Tema:** Gestión de biblioteca  
**Stack:** Angular 22 + Spring Boot 3.5 + PostgreSQL + JWT

## Funcionalidades

- Registro e inicio de sesión.
- Seguridad JWT con roles `ADMIN` y `LECTOR`.
- CRUD de autores.
- CRUD de categorías.
- CRUD y búsqueda de libros.
- Control de ejemplares disponibles.
- Registro y devolución de préstamos.
- Detección de préstamos vencidos.
- Administración de usuarios y roles.
- Validaciones frontend/backend.
- Diseño responsivo.
- Persistencia PostgreSQL real; no usa mocks.

## 1. Base de datos

### Opción A — Docker

Desde la raíz:

```bash
docker compose up -d postgres
```

### Opción B — PostgreSQL instalado localmente

```bash
sudo -u postgres psql
CREATE DATABASE biblioteca_examen;
ALTER USER postgres WITH PASSWORD 'postgres';
\q
```

> Hibernate crea/actualiza las tablas automáticamente. `database/schema.sql` documenta el modelo físico para el examen.

## 2. Backend

Requisitos: Java 21+ y Maven.

```bash
cd backend
mvn spring-boot:run
```

API: `http://localhost:8080/api`

Credenciales iniciales:

- Administrador: `admin` / `Admin123*`
- Lector: `lector` / `Lector123*`

Si tu PostgreSQL usa otra contraseña:

```bash
DB_PASSWORD='TU_PASSWORD' mvn spring-boot:run
```

Variables disponibles:

```text
DB_URL
DB_USER
DB_PASSWORD
JWT_SECRET
JWT_EXPIRATION_MS
FRONTEND_URL
SERVER_PORT
```

## 3. Frontend

Requisitos: Node.js y npm.

```bash
cd frontend
npm install
npm start
```

Abrir:

`http://localhost:4200`

## 4. Orden correcto para demostrar

1. Levantar PostgreSQL.
2. Ejecutar backend y mostrar que inicia en 8080.
3. Ejecutar Angular en 4200.
4. Entrar como `admin`.
5. Crear un autor y una categoría.
6. Crear un libro.
7. Registrar un préstamo a `lector` y observar que baja la disponibilidad.
8. Registrar la devolución y observar que aumenta.
9. Entrar como `lector` para mostrar restricciones.
10. Mostrar las tablas desde PostgreSQL.

## 5. Consultas PostgreSQL para la defensa

```bash
psql -U postgres -d biblioteca_examen
```

```sql
\dt
SELECT id, username, role, enabled FROM usuarios;
SELECT id, title, total_copies, available_copies FROM libros;
SELECT id, user_id, book_id, loan_date, due_date, return_date, status FROM prestamos;
```

## 6. Documentación incluida

- `docs/ANALISIS_Y_DISENO.md`: requerimientos, entidades, justificación y diagramas.
- `docs/API_REST.md`: endpoints y ejemplos JSON.
- `docs/PRUEBAS.md`: plan de pruebas y evidencias.
- `docs/DEFENSA.md`: preguntas técnicas y respuestas preparadas.
- `database/schema.sql`: diseño físico SQL.
- `postman/Biblioteca.postman_collection.json`: colección para probar la API.

## 7. Guardar el trabajo en tu rama

Una vez copies este proyecto dentro de tu repositorio:

```bash
git status
git add .
git commit -m "Implementa sistema completo de gestión de biblioteca"
git log --oneline --decorate -5
```

Tu commit anterior no incluyó archivos porque el repositorio estaba vacío: `git add .` no tiene nada que agregar hasta que existan archivos.
