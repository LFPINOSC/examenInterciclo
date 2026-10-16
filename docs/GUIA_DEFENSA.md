# Guía de defensa – Inventario Comercial

En la defensa te harán **2 preguntas de backend/API REST y 2 de frontend** (5 de los 10 puntos).
Cada respuesta indica el archivo que conviene abrir para mostrarlo en vivo.

---

## A. Diseño de la base de datos

**¿Por qué esas entidades?**
Partí de las preguntas que el sistema debe responder: *qué hay* (Producto), *cómo se agrupa* (Categoría),
*a quién se compra* (Proveedor), *qué entró o salió* (MovimientoInventario) y *quién lo hizo* (Usuario).
Cada entidad tiene datos propios que se repetirían si estuvieran dentro de otra tabla; separarlas es
normalizar (Codd, 1970) y evita inconsistencias, por ejemplo escribir "Bebidas" y "bebida".

**¿Por qué existe la tabla de movimientos si el producto ya tiene stock?**
El campo `stock` dice *cuánto hay*; la tabla de movimientos dice *por qué* hay esa cantidad, cuándo
cambió y quién lo hizo. Es el kardex: permite auditar y corregir errores anulando un movimiento.

**¿Por qué las relaciones son 1:N?**
Una categoría tiene muchos productos, pero un producto pertenece a una sola categoría. Lo mismo ocurre
con el proveedor, el producto y sus movimientos, y el usuario y sus movimientos. La clave foránea va
siempre del lado "muchos" (Chen, 1976).

**¿Qué restricciones usaste?**
Claves primarias autoincrementales, claves foráneas, `UNIQUE` en `codigo`, `ruc` y `username`, y `CHECK`
para que precios y stock no sean negativos y la cantidad sea mayor a 0.
Archivo: `database/inventario_comercial.sql`.

**¿Por qué DECIMAL y no DOUBLE para los precios?**
`DOUBLE` es de punto flotante y produce errores de redondeo con dinero (0.1 + 0.2 ≠ 0.3). `DECIMAL(10,2)`
es exacto. En Java se usa `BigDecimal` por la misma razón.

---

## B. Backend y API REST

**¿Qué es una API REST?**
Es un estilo de arquitectura en el que cada **recurso** tiene una URL (`/api/productos`) y se opera con los
**métodos HTTP**: GET consulta, POST crea, PUT actualiza y DELETE elimina. No guarda estado entre
peticiones: cada petición trae todo lo necesario, incluido el token (Fielding, 2000).

**¿Cómo está organizado el backend?**
Por capas. El **Controller** recibe la petición HTTP, el **Service** aplica las reglas de negocio, el
**Repository** accede a la base de datos y el **Model** son las entidades. Así cada capa tiene una sola
responsabilidad y es fácil de cambiar o probar.
Ejemplo para mostrar: `ProductoController` → `ProductoService` → `ProductoRepository`.

**¿Qué hace JPA/Hibernate?**
Es un ORM: convierte clases Java (`@Entity`) en tablas y genera el SQL. Con Spring Data JPA solo declaro
métodos como `existsByCodigoIgnoreCase(...)` y la consulta se genera a partir del nombre.

**¿Cómo funciona el login y la seguridad?** (pregunta muy probable)
1. El frontend envía usuario y contraseña a `POST /api/auth/login`.
2. Spring Security busca al usuario (`UserDetailsServiceImpl`) y compara la contraseña con **BCrypt**.
3. Si es correcta, `JwtService` genera un **token JWT** firmado con HMAC-SHA256 que contiene el usuario,
   el rol y la fecha de expiración (8 horas) (Jones et al., 2015).
4. En cada petición, `JwtAuthFilter` lee la cabecera `Authorization: Bearer <token>`, valida la firma y
   la expiración, y marca al usuario como autenticado.
5. `SecurityConfig` decide qué rol puede usar cada ruta: el ADMIN puede hacer todo y el EMPLEADO consulta
   y registra movimientos.

**¿Por qué BCrypt y no guardar la contraseña tal cual?**
BCrypt genera un *hash* con sal aleatoria y es lento a propósito, lo que dificulta los ataques de fuerza
bruta (Provos y Mazières, 1999). Ni siquiera el administrador puede ver las contraseñas. Además, el
campo tiene `@JsonIgnore` para que nunca viaje en el JSON.

**¿Por qué JWT y no sesiones?**
Con JWT el servidor no guarda sesiones (STATELESS): toda la información va firmada en el token. Esto
encaja con REST y permite que el frontend y el backend estén separados.

**¿Cómo se actualiza el stock?** (muestra `MovimientoService.registrar`)
Una entrada suma y una salida resta, pero antes valida que haya stock suficiente. Todo ocurre dentro de
`@Transactional`: si algo falla, no se guarda ni el movimiento ni el cambio de stock (atomicidad).

**¿Cómo validas los datos?**
En dos niveles:
- **Formato**, con Bean Validation en DTOs y entidades: `@NotBlank`, `@Pattern` para el RUC de 13
  dígitos, `@Min` y `@DecimalMin`. Con `@Valid` en el controller, si algo falla se responde 400 con el
  campo y el mensaje.
- **Negocio**, en el service: código duplicado, precio de venta menor al de compra, stock insuficiente.

**¿Cómo manejas los errores?**
`GlobalExceptionHandler` (`@RestControllerAdvice`) convierte cada excepción en un JSON uniforme con el
código HTTP correcto: 404 si no existe, 400 si los datos son inválidos y 409 si hay conflicto.

**¿Qué códigos HTTP devuelves?**
200 OK, 201 Created al crear, 204 No Content al eliminar, 400, 401 sin token, 403 sin permiso y 404
(Fielding et al., 2022).

**¿Por qué usas DTOs en algunos casos?**
`ProductoRequest` recibe `categoriaId` y `proveedorId` en lugar de objetos completos, y separa lo que el
cliente puede enviar de cómo se guarda. Por ejemplo, el stock no se modifica al editar.

**¿Qué es CORS?**
Es una protección del navegador que bloquea las peticiones a otro origen (de 5173 a 8080). Lo resolví
de dos formas: el proxy de Vite durante el desarrollo y la configuración CORS en `SecurityConfig`.

---

## C. Frontend

**¿Cómo se conecta el frontend con el backend?**
Todo pasa por `src/api/api.js`, que usa `fetch` contra `/api/...`, agrega el token en la cabecera,
convierte la respuesta a JSON y lanza un error con el mensaje del backend. El proxy de Vite
(`vite.config.js`) redirige `/api` a `http://localhost:8080`.

**¿Dónde se guarda la sesión?**
El token y los datos del usuario se guardan en `localStorage`. `AuthContext` los comparte con toda la
app mediante Context API. Si el backend responde 401 (token vencido), se borra la sesión y se redirige al
login.

**¿Cómo proteges las rutas?**
`RutaProtegida.jsx` redirige al login si no hay sesión y, para `/usuarios`, exige el rol ADMIN.
Ocultar botones es solo comodidad visual: **la seguridad real está en el backend**, que responde 403
aunque alguien llame la API directamente.

**¿Cómo validas los formularios?**
Cada página tiene una función `validar()` que revisa los campos antes de enviar: obligatorios, RUC de 13
dígitos, correo, precios positivos, venta ≥ compra y cantidad ≤ stock en las salidas. Los errores se
muestran debajo de cada campo con el componente `Campo`. Si el backend rechaza algo, también se muestra
su mensaje.

**¿Por qué validar en el frontend y en el backend?**
En el frontend, para dar respuesta inmediata al usuario. En el backend, porque el frontend se puede
saltar (Postman, navegador). Nunca se confía solo en el cliente.

**¿Qué hooks de React usaste?**
- `useState`: guarda el estado de la lista, el formulario, los errores y el modal.
- `useEffect`: carga los datos al abrir la página. En Productos espera 300 ms tras escribir antes de
  buscar (*debounce*), para no consultar al servidor en cada tecla.
- `useContext`, mediante `useAuth()`: accede a la sesión.

**¿Cómo está organizado?**
`pages/` (una pantalla por recurso), `components/` (Modal, Campo, Mensaje, Layout, RutaProtegida),
`api/` (cliente HTTP), `context/` (sesión) y `utils/` (formato de dinero y fecha).

**¿Cómo funciona el CRUD en una página?** (muestra `Categorias.jsx`)
- *Listar*: `GET` en el `useEffect`.
- *Crear y editar*: el mismo formulario en un modal. `editandoId` decide si se hace `POST` o `PUT`.
- *Eliminar*: confirmación y luego `DELETE`. Después de cada operación se vuelve a cargar la lista.

---

## D. Demostración rápida (5 minutos)

1. Login con una contraseña errónea y después con `admin`.
2. Dashboard: mostrar los productos con stock bajo.
3. Crear un producto (mostrar las validaciones con campos vacíos) y luego editarlo.
4. Movimientos: intentar una salida mayor al stock (rechazada), registrar una entrada y ver cómo sube
   el stock.
5. Intentar eliminar una categoría con productos y mostrar el mensaje.
6. Cerrar sesión, entrar como `empleado` y mostrar que no puede editar ni ver Usuarios.

---

## Referencias

Chen, P. P.-S. (1976). The entity-relationship model—Toward a unified view of data. *ACM Transactions on
Database Systems, 1*(1), 9–36. https://doi.org/10.1145/320434.320440

Codd, E. F. (1970). A relational model of data for large shared data banks. *Communications of the ACM,
13*(6), 377–387. https://doi.org/10.1145/362384.362685

Fielding, R. T. (2000). *Architectural styles and the design of network-based software architectures*
[Tesis doctoral, University of California, Irvine].

Fielding, R., Nottingham, M., & Reschke, J. (Eds.). (2022). *HTTP semantics* (RFC 9110). Internet
Engineering Task Force. https://doi.org/10.17487/RFC9110

Jones, M., Bradley, J., & Sakimura, N. (2015). *JSON Web Token (JWT)* (RFC 7519). Internet Engineering
Task Force. https://doi.org/10.17487/RFC7519

Provos, N., & Mazières, D. (1999). A future-adaptable password scheme. En *Proceedings of the 1999
USENIX Annual Technical Conference, FREENIX Track* (pp. 81–91). USENIX Association.
