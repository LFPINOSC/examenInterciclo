# Sistema de Inventario Comercial

**Examen interciclo – Desarrollo de Aplicaciones Web (Frontend y Backend)**
**Estudiante:** Kevin Stalin Marca Gutama · N.º 15 · Universidad Católica de Cuenca

Aplicación web para controlar el inventario de un comercio: productos, categorías, proveedores y las
entradas/salidas de mercadería, con inicio de sesión y permisos por rol.

| Capa | Tecnología |
|---|---|
| Base de datos | MySQL 8 |
| Backend | Java 17 · Spring Boot 3.3 · Spring Data JPA · Spring Security + JWT · Bean Validation |
| Frontend | React 18 · Vite · React Router |

---

## 1. Análisis del problema

Un comercio necesita saber **qué productos tiene, cuántas unidades hay, a quién se los compra y qué
entró o salió, cuándo y quién lo registró**. Hoy eso se lleva a mano, lo que produce descuadres de stock
y no permite saber cuándo reabastecer.

### Requerimientos funcionales

| Código | Requerimiento |
|---|---|
| RF-01 | Iniciar y cerrar sesión con usuario y contraseña. |
| RF-02 | Controlar permisos por rol: **ADMIN** (todo) y **EMPLEADO** (consulta y registra movimientos). |
| RF-03 | Registrar, consultar, actualizar y eliminar **categorías**. |
| RF-04 | Registrar, consultar, actualizar y eliminar **proveedores** (RUC de 13 dígitos, único). |
| RF-05 | Registrar, consultar, actualizar y eliminar **productos**, con categoría, proveedor, precios y stock mínimo. |
| RF-06 | Buscar productos por nombre o código. |
| RF-07 | Registrar **entradas** (compras) y **salidas** (ventas) que actualizan el stock automáticamente. |
| RF-08 | Impedir salidas mayores al stock disponible. |
| RF-09 | Consultar el historial de movimientos (kardex), filtrable por producto, y anular un movimiento revirtiendo el stock. |
| RF-10 | Alertar los productos con stock igual o menor al mínimo. |
| RF-11 | Mostrar un resumen: totales y valor del inventario. |
| RF-12 | Gestionar usuarios (solo ADMIN). |

### Reglas de negocio

- El stock **solo cambia por movimientos**; al editar un producto no se toca el stock (así queda historial).
- El precio de venta no puede ser menor al de compra.
- No se elimina una categoría o proveedor con productos, ni un producto o usuario con movimientos (se **desactivan**).
- El usuario que registra un movimiento se toma del **token**, no del formulario (no se puede suplantar).

---

## 2. Diseño de la base de datos

### Entidades identificadas y por qué

| Entidad | Justificación |
|---|---|
| **Usuario** | Necesaria para la seguridad (login, roles) y para auditar quién registró cada movimiento. |
| **Categoría** | Agrupa productos; se separa para no repetir el nombre en cada producto (normalización) y poder filtrar. |
| **Proveedor** | Un proveedor abastece muchos productos; sus datos (RUC, contacto) no deben repetirse en cada producto. |
| **Producto** | Es el centro del inventario: código, precios, stock actual y stock mínimo. |
| **MovimientoInventario** | Registra cada entrada/salida. Sin esta tabla solo sabríamos el stock actual, no *por qué* cambió. |

### Diagrama entidad-relación

```mermaid
erDiagram
    CATEGORIA ||--o{ PRODUCTO : "clasifica"
    PROVEEDOR ||--o{ PRODUCTO : "abastece"
    PRODUCTO  ||--o{ MOVIMIENTO_INVENTARIO : "es afectado por"
    USUARIO   ||--o{ MOVIMIENTO_INVENTARIO : "registra"
```

- Una **categoría** clasifica a muchos productos; un producto pertenece a una sola categoría (1:N).
- Un **proveedor** abastece muchos productos; cada producto tiene un proveedor principal (1:N).
- Un **producto** tiene muchos movimientos; cada movimiento afecta a un producto (1:N).
- Un **usuario** registra muchos movimientos; cada movimiento lo registra un usuario (1:N).

### Diagrama de tablas

```mermaid
erDiagram
    USUARIO {
        BIGINT id PK
        VARCHAR nombre
        VARCHAR username UK
        VARCHAR password "BCrypt"
        VARCHAR rol "ADMIN | EMPLEADO"
        BOOLEAN activo
        DATETIME fecha_creacion
    }
    CATEGORIA {
        BIGINT id PK
        VARCHAR nombre UK
        VARCHAR descripcion
    }
    PROVEEDOR {
        BIGINT id PK
        VARCHAR ruc UK "13 digitos"
        VARCHAR razon_social
        VARCHAR telefono
        VARCHAR email
        VARCHAR direccion
    }
    PRODUCTO {
        BIGINT id PK
        VARCHAR codigo UK
        VARCHAR nombre
        VARCHAR descripcion
        DECIMAL precio_compra
        DECIMAL precio_venta
        INT stock
        INT stock_minimo
        BOOLEAN activo
        BIGINT categoria_id FK
        BIGINT proveedor_id FK
    }
    MOVIMIENTO_INVENTARIO {
        BIGINT id PK
        VARCHAR tipo "ENTRADA | SALIDA"
        INT cantidad
        VARCHAR motivo
        DATETIME fecha
        BIGINT producto_id FK
        BIGINT usuario_id FK
    }
    CATEGORIA ||--o{ PRODUCTO : categoria_id
    PROVEEDOR ||--o{ PRODUCTO : proveedor_id
    PRODUCTO  ||--o{ MOVIMIENTO_INVENTARIO : producto_id
    USUARIO   ||--o{ MOVIMIENTO_INVENTARIO : usuario_id
```

El script completo está en [`database/inventario_comercial.sql`](database/inventario_comercial.sql).

---

## 3. Backend – API REST

Arquitectura por capas: **Controller → Service → Repository → Base de datos**.

```
backend/src/main/java/com/kevmarca/inventario/
├── config/       SecurityConfig (reglas de acceso, CORS, BCrypt) y DataInitializer (usuarios iniciales)
├── security/     JwtService, JwtAuthFilter, UserDetailsServiceImpl
├── model/        Entidades JPA (tablas)
├── repository/   Interfaces Spring Data JPA (consultas)
├── dto/          Objetos de entrada/salida con validaciones
├── service/      Lógica y reglas de negocio
├── controller/   Endpoints REST
└── exception/    Manejo global de errores en JSON
```

### Endpoints

Todas las rutas (excepto el login) requieren la cabecera `Authorization: Bearer <token>`.

| Método | Ruta | Descripción | Rol |
|---|---|---|---|
| POST | `/api/auth/login` | Inicia sesión, devuelve el token JWT | Público |
| GET | `/api/auth/perfil` | Datos del usuario actual | Autenticado |
| GET | `/api/resumen` | Indicadores del dashboard | Autenticado |
| GET | `/api/categorias` · `/api/categorias/{id}` | Listar / obtener | Autenticado |
| POST · PUT · DELETE | `/api/categorias` · `/api/categorias/{id}` | Crear / actualizar / eliminar | ADMIN |
| GET | `/api/proveedores` · `/api/proveedores/{id}` | Listar / obtener | Autenticado |
| POST · PUT · DELETE | `/api/proveedores` · `/api/proveedores/{id}` | Crear / actualizar / eliminar | ADMIN |
| GET | `/api/productos?buscar=` · `/api/productos/{id}` | Listar (con búsqueda) / obtener | Autenticado |
| GET | `/api/productos/stock-bajo` | Productos por reabastecer | Autenticado |
| POST · PUT · DELETE | `/api/productos` · `/api/productos/{id}` | Crear / actualizar / eliminar | ADMIN |
| GET | `/api/movimientos?productoId=` · `/api/movimientos/{id}` | Historial / obtener | Autenticado |
| POST | `/api/movimientos` | Registrar entrada o salida | Autenticado |
| DELETE | `/api/movimientos/{id}` | Anular (revierte stock) | ADMIN |
| GET · POST · PUT · DELETE | `/api/usuarios` · `/api/usuarios/{id}` | CRUD de usuarios | ADMIN |

### Códigos de respuesta

`200` OK · `201` creado · `204` eliminado · `400` datos inválidos o regla de negocio · `401` sin sesión ·
`403` sin permiso · `404` no existe · `409` conflicto de integridad.

Ejemplo de error:

```json
{ "estado": 400, "mensaje": "Datos inválidos", "errores": { "ruc": "El RUC debe tener 13 dígitos" } }
```

---

## 4. Frontend

React con páginas para **Inicio, Productos, Movimientos, Categorías, Proveedores y Usuarios**.
Todas consumen la API real mediante `src/api/api.js` (no hay datos simulados).

- Validación en el formulario antes de enviar y además muestra los errores que devuelve el backend.
- Menú y botones según el rol: el EMPLEADO no ve los botones de editar/eliminar ni la página de usuarios.
- Si el token expira, se cierra la sesión y vuelve al login.

---

## 5. Cómo ejecutar

### Requisitos
- MySQL 8 · JDK 17 o superior · Maven (o el soporte Maven de VS Code / IntelliJ) · Node.js 18 o superior

### Paso 1 – Base de datos
Ejecuta `database/inventario_comercial.sql` en MySQL Workbench (crea la base y los datos de prueba).

### Paso 2 – Backend
Revisa usuario y contraseña de MySQL en `backend/src/main/resources/application.properties` y ejecuta:

```bash
cd backend
mvn spring-boot:run
```

Queda en `http://localhost:8080`. Al arrancar crea los usuarios:

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | ADMIN |
| `empleado` | `empleado123` | EMPLEADO |

### Paso 3 – Frontend
```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`.

### Pruebas sugeridas
1. Ingresar con una contraseña errónea → mensaje de error.
2. Como **admin**: crear categoría, proveedor y producto; editarlos; intentar eliminar una categoría con productos → se bloquea.
3. Registrar una **salida** mayor al stock → se rechaza. Registrar una **entrada** → el stock sube.
4. Anular un movimiento → el stock vuelve a su valor anterior.
5. Ingresar como **empleado** → solo consulta y registra movimientos; la página Usuarios no aparece.
