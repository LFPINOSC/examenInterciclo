# Examen interciclo — Gestión de biblioteca

**Estudiante:** Braddley Andrés Estrella Salinas  
**Tema:** Gestión de biblioteca  
**Stack:** Angular 22.2.3 + TypeScript 6.0.3 + Spring Boot 3.5 + PostgreSQL + JWT

## Funcionalidades

- Registro e inicio de sesión.
- Seguridad JWT y BCrypt.
- Roles `ADMIN` y `LECTOR`.
- CRUD de autores.
- CRUD de categorías.
- CRUD y búsqueda de libros.
- Control de ejemplares disponibles.
- Registro y devolución de préstamos.
- Detección de préstamos vencidos.
- Administración de usuarios y roles.
- Validaciones frontend/backend.
- Diseño responsivo.
- Persistencia PostgreSQL real, sin datos simulados en Angular.

## 1. PostgreSQL

Comprueba el servicio:

```bash
sudo systemctl status postgresql --no-pager
```

Desde la raíz del proyecto prepara la base si todavía no existe:

```bash
./scripts/prepare_database.sh
```

El backend usa por defecto:

```text
Base: biblioteca_examen
Host: localhost
Puerto: 5432
Usuario: postgres
Contraseña: postgres
```

Si tu contraseña de PostgreSQL es distinta, no edites el código; inicia el backend así:

```bash
DB_PASSWORD='TU_PASSWORD' mvn spring-boot:run
```

### Si ya ejecutaste la versión anterior

La versión anterior dejó libros de demostración guardados físicamente en PostgreSQL. Para iniciar limpio, **detén primero el backend** y ejecuta una sola vez:

```bash
./scripts/reset_database.sh
```

Escribe `REINICIAR` cuando lo pida. Después, al iniciar Spring Boot, Hibernate creará las tablas y únicamente se crearán las cuentas `admin` y `lector`.

## 2. Backend

Requisitos: Java 21+ y Maven.

```bash
cd backend
mvn spring-boot:run
```

API:

```text
http://localhost:8080/api
```

Credenciales iniciales:

```text
ADMIN
usuario: admin
contraseña: Admin123*

LECTOR
usuario: lector
contraseña: Lector123*
```

## 3. Frontend

En otra terminal:

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

Abrir:

```text
http://localhost:4200
```

> Si el navegador tenía abierta la versión anterior, recarga con `Ctrl+Shift+R`. La clave de sesión del borrador anterior se elimina automáticamente.

## 4. Primera prueba recomendada

Entra como `admin` y realiza exactamente este flujo:

1. **Autores → Nuevo autor**. Crea `Miguel de Cervantes`, nacionalidad `Española`.
2. **Categorías → Nueva categoría**. Crea `Novela`.
3. **Libros → Nuevo libro**. Crea `Don Quijote de la Mancha`, ISBN `9788420412146`, año `1605`, 3 ejemplares.
4. Comprueba que aparece inmediatamente `3 / 3`.
5. **Préstamos → Nuevo préstamo**. Selecciona el libro y el usuario `lector`.
6. Comprueba que la disponibilidad queda `2 / 3`.
7. Pulsa **Devolver**.
8. Comprueba que vuelve a `3 / 3`.
9. Edita el libro y comprueba el cambio inmediatamente.
10. Cierra sesión e ingresa como `lector` para demostrar restricciones por rol.

## 5. Comprobar PostgreSQL directamente

```bash
psql -U postgres -h localhost -d biblioteca_examen
```

Dentro:

```sql
\dt
SELECT id, username, nombre_completo, email, role, enabled FROM usuarios ORDER BY id;
SELECT id, title, isbn, total_copies, available_copies FROM libros ORDER BY id;
SELECT id, user_id, book_id, loan_date, due_date, return_date, status FROM prestamos ORDER BY id;
```

Salir:

```sql
\q
```

## 6. Arquitectura

```text
Navegador
   │
   │ Angular 22 :4200
   │ HttpClient + JWT
   ▼
Spring Boot :8080
   │ Controller
   │ Service
   │ Repository/JPA
   │ Spring Security + JWT
   ▼
PostgreSQL :5432
   ├── usuarios
   ├── autores
   ├── categorias
   ├── libros
   └── prestamos
```

## 7. Documentación para la defensa

- `docs/ANALISIS_Y_DISENO.md`: requerimientos, entidades, justificación y diagramas.
- `docs/API_REST.md`: endpoints y ejemplos JSON.
- `docs/PRUEBAS.md`: plan de pruebas y evidencias.
- `docs/DEFENSA.md`: preguntas técnicas y respuestas preparadas.
- `database/schema.sql`: diseño físico SQL.
- `database/RESET_IMPORTANTE.md`: cómo limpiar el borrador anterior.
- `postman/Biblioteca.postman_collection.json`: pruebas de API.

## 8. Guardar en tu rama

```bash
git status
git add .
git commit -m "Implementa examen completo de gestión de biblioteca"
git log --oneline --decorate -5
```

## Corrección Angular 22

Angular 22 utiliza `OnPush` como estrategia de detección de cambios por defecto. Las pantallas CRUD de este proyecto usan explícitamente `ChangeDetectionStrategy.Eager` junto con `provideZoneChangeDetection(...)`, porque manejan estado mutable tradicional (`arrays`, `boolean`, formularios template-driven) actualizado desde `HttpClient.subscribe()`. De esta manera los resultados de crear, editar, eliminar, iniciar sesión y cargar tablas se reflejan inmediatamente sin recargar manualmente la página.
