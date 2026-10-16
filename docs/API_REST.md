# API REST

Base URL: `http://localhost:8080/api`

Todas las rutas salvo `/auth/login` y `/auth/register` requieren:

`Authorization: Bearer <token>`

| Método | Endpoint | Rol | Operación |
|---|---|---|---|
| POST | `/auth/login` | Público | Iniciar sesión |
| POST | `/auth/register` | Público | Registrar lector |
| GET | `/authors` | Autenticado | Listar autores |
| POST | `/authors` | ADMIN | Crear autor |
| PUT | `/authors/{id}` | ADMIN | Actualizar autor |
| DELETE | `/authors/{id}` | ADMIN | Eliminar autor |
| GET | `/categories` | Autenticado | Listar categorías |
| POST | `/categories` | ADMIN | Crear categoría |
| PUT | `/categories/{id}` | ADMIN | Actualizar categoría |
| DELETE | `/categories/{id}` | ADMIN | Eliminar categoría |
| GET | `/books?q=texto` | Autenticado | Listar/buscar libros |
| GET | `/books/{id}` | Autenticado | Consultar libro |
| POST | `/books` | ADMIN | Crear libro |
| PUT | `/books/{id}` | ADMIN | Actualizar libro |
| DELETE | `/books/{id}` | ADMIN | Eliminar libro |
| GET | `/loans` | Autenticado | ADMIN: todos; LECTOR: propios |
| POST | `/loans` | Autenticado | Crear préstamo |
| PUT | `/loans/{id}/return` | Autenticado | Registrar devolución |
| DELETE | `/loans/{id}` | ADMIN | Eliminar préstamo ya devuelto |
| GET | `/users` | ADMIN | Listar usuarios |
| PUT | `/users/{id}` | ADMIN | Cambiar datos/rol/estado |
| DELETE | `/users/{id}` | ADMIN | Eliminar usuario |

## Ejemplo: login

```json
{
  "username": "admin",
  "password": "Admin123*"
}
```

## Ejemplo: crear libro

```json
{
  "title": "El principito",
  "isbn": "9780156012195",
  "publicationYear": 1943,
  "totalCopies": 4,
  "authorId": 1,
  "categoryId": 1,
  "active": true
}
```

## Ejemplo: préstamo

```json
{
  "bookId": 1,
  "userId": 2,
  "dueDate": "2026-10-30"
}
```

Si quien crea el préstamo es LECTOR, el backend ignora `userId` y usa la identidad obtenida del JWT.
