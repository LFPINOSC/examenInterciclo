# Control de Órdenes de Trabajo

Aplicación web para registrar y dar seguimiento a las **órdenes de trabajo** de un taller o servicio técnico: quién pide el trabajo, sobre qué equipo, qué técnico lo atiende, qué tareas se hicieron y cuánto costaron.

Proyecto del **Examen Interciclo de Programación Web** · Estudiante: Rafael Sebastián Rivas Carmona (n.º 17) · Rama `estudiante-17-rafael-rivas`.

---

## ¿Qué hace?

- **Clientes y equipos:** se registran los clientes y los equipos que les pertenecen (laptop, impresora, etc.).
- **Órdenes de trabajo:** se crean con cliente, equipo, descripción del problema, prioridad y técnico asignado. Cada una recibe un código automático (`OT-00001`) y pasa por los estados *Pendiente → En proceso → Completada* (o *Cancelada*).
- **Tareas:** dentro de cada orden se registran las tareas realizadas con sus horas y costo; el **costo total** de la orden se calcula solo.
- **Usuarios y roles:** el administrador registra técnicos y otros administradores. Cada técnico ve únicamente las órdenes que le asignaron.
- **Búsqueda y filtros** de órdenes por código, cliente y estado, y un resumen con la cantidad de órdenes por estado.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | Angular 22 (componentes standalone, signals, formularios reactivos) |
| Backend | Spring Boot 3.5, Java 21, Spring Data JPA, Spring Security |
| Base de datos | PostgreSQL |
| Seguridad | JWT (sesión sin estado) y contraseñas con BCrypt |

```
Navegador (Angular :4200) ──HTTP/JSON + JWT──► API Spring Boot (:8080) ──JPA──► PostgreSQL
```

## Estructura del repositorio

```
backend/ordenes-trabajo-api/   API REST (controller, servicio, repositorio, dto, seguridad, excepcion)
frontend/                      Aplicación Angular (core, compartido, paginas)
database/schema.sql            Script SQL de las tablas
COMANDOS.txt                   Comandos resumidos para ejecutar
```

---

## Cómo ejecutarlo

### Requisitos
- Java 21 y Maven
- Node.js 20 o superior y npm
- PostgreSQL en ejecución (`sudo systemctl start postgresql`)

### 1. Base de datos (solo la primera vez)
```bash
createdb -h localhost -U kotaro ordenes_trabajo
```
La API usa por defecto el usuario `kotaro` con clave `kotaro`. Para otras credenciales:
```bash
DB_USUARIO=mi_usuario DB_PASSWORD=mi_clave mvn spring-boot:run
```
Las tablas las crea Hibernate al arrancar la API. Si prefieres crearlas a mano con SQL:
```bash
psql -h localhost -U kotaro -d ordenes_trabajo -f database/schema.sql
```

### 2. API (terminal 1, puerto 8080)
```bash
cd backend/ordenes-trabajo-api
mvn spring-boot:run
```
Espera el mensaje `Started OrdenesTrabajoApplication`. En el primer arranque se crea el administrador inicial.

### 3. Frontend (terminal 2, puerto 4200)
```bash
cd frontend
npm install     # solo la primera vez
npm start
```
Abre **http://localhost:4200**.

### Cuenta inicial
| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | `admin` | `Admin123*` |

Los técnicos los registra el administrador desde el menú **Usuarios**.

---

## Cómo se usa

### Como administrador
1. **Usuarios** → *Nuevo usuario*: registra un técnico (rol *Técnico*). La contraseña debe tener mínimo 8 caracteres, con letras y números. Aquí también puedes desactivar o reactivar cuentas.
2. **Clientes** → registra al cliente (la cédula ecuatoriana se valida).
3. **Equipos** → registra los equipos del cliente.
4. **Órdenes** → *Nueva orden*: elige el cliente (el desplegable de equipos muestra solo los suyos), asigna un técnico, describe el problema y define la prioridad.
5. Abre la orden (**Ver**) para agregar tareas con horas y costo, y para cambiar su estado. Con **Editar** puedes modificar cualquier dato de la orden.
6. El **Inicio** muestra cuántas órdenes hay en cada estado; al pulsar un estado se listan las órdenes correspondientes.

### Como técnico
1. Inicia sesión con el usuario que te dio el administrador.
2. En **Órdenes** verás solo las que tienes asignadas.
3. Abre una orden para registrar tareas (puedes marcarlas como hechas) y cambiar el estado, por ejemplo a *En proceso* y luego a *Completada*. Al completarla se registra la fecha de entrega.

### Permisos por rol
| Acción | Administrador | Técnico |
|---|---|---|
| Ver órdenes | todas | solo las suyas |
| Crear, editar y eliminar órdenes | sí | no |
| Cambiar estado y gestionar tareas | sí | solo en sus órdenes |
| Clientes, equipos y usuarios | sí | no |

### Reglas que conviene saber
- No se puede eliminar un cliente o equipo que tenga órdenes asociadas, ni un usuario con órdenes (se desactiva en su lugar).
- Al eliminar una orden se eliminan también sus tareas.
- Tras 5 intentos fallidos de inicio de sesión, la cuenta se desactiva y solo un administrador puede reactivarla.
- La sesión dura 8 horas; al vencer, la aplicación pide iniciar sesión de nuevo.

---

## API REST

Prefijo `/api`. Resumen:

| Recurso | Métodos |
|---|---|
| `/auth/login`, `/auth/perfil` | POST, GET |
| `/admin/usuarios`, `/admin/usuarios/{id}`, `/admin/usuarios/{id}/activo` | GET, POST, PUT, PATCH, DELETE |
| `/clientes`, `/equipos` | GET, POST, PUT, DELETE |
| `/ordenes`, `/ordenes/{id}`, `/ordenes/{id}/estado` | GET, POST, PUT, PATCH, DELETE |
| `/ordenes/{id}/tareas`, `/tareas/{id}` | POST, PUT, DELETE |
| `/tecnicos`, `/resumen` | GET |

Todas las rutas, salvo el login, exigen la cabecera `Authorization: Bearer <token>`. Los errores usan un formato JSON único (`status`, `mensaje`, `errores` por campo).

### Pruebas de la API
Con la API encendida:
```bash
cd backend/ordenes-trabajo-api
./pruebas.sh
```
Ejecuta 36 comprobaciones: autenticación, permisos por rol, validaciones, reglas de integridad y CRUD.
