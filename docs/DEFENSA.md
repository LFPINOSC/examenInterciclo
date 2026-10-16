# Guía de defensa individual

## Explicación corta del proyecto

> Desarrollé un sistema de gestión de biblioteca con Angular, Spring Boot y PostgreSQL. Identifiqué cinco entidades: Usuario, Autor, Categoría, Libro y Préstamo. Préstamo es la entidad transaccional que relaciona a un usuario con un libro y conserva fechas y estado. El backend expone una API REST con CRUD, aplica reglas de negocio en la capa Service y protege los endpoints con Spring Security y JWT. El frontend consume datos reales mediante HttpClient, usa un interceptor para enviar el token y guards para controlar la navegación.

## Backend / API REST — preguntas probables

### 1. ¿Por qué usó una entidad Préstamo en lugar de guardar `usuario_id` directamente en Libro?
Porque un mismo libro puede ser prestado muchas veces a diferentes usuarios en momentos distintos. Préstamo representa una relación histórica N:M entre Usuario y Libro y además necesita atributos propios: fecha de préstamo, fecha límite, fecha de devolución y estado.

### 2. ¿Cuál es la diferencia entre Controller, Service y Repository?
El Controller recibe la petición HTTP y devuelve la respuesta. El Service aplica las reglas de negocio y coordina operaciones. El Repository encapsula el acceso a PostgreSQL mediante JPA. Separarlos evita mezclar HTTP, negocio y persistencia.

### 3. ¿Qué hace REST en este proyecto?
Modela la información como recursos accesibles mediante URLs. Se usan GET para consultar, POST para crear, PUT para actualizar y DELETE para eliminar. Las respuestas utilizan JSON y códigos HTTP.

### 4. ¿Cómo se protege la API?
El usuario se autentica con credenciales. El backend compara la contraseña usando BCrypt y, si es correcta, emite un JWT firmado. En las siguientes peticiones el frontend envía `Authorization: Bearer <token>`. Un filtro valida el token antes de permitir el acceso.

### 5. ¿JWT cifra la contraseña?
No. La contraseña se almacena como hash BCrypt. JWT representa la sesión/autenticación del cliente y está firmado para detectar modificaciones; no sustituye el hashing de contraseñas.

### 6. ¿Por qué el backend también valida si el frontend ya valida?
Porque el frontend puede ser manipulado o la API puede consumirse desde Postman/curl. La validación de seguridad y negocio siempre debe existir en el backend. La validación del frontend mejora la experiencia de usuario.

### 7. ¿Qué evita que un lector cree libros llamando la API manualmente?
`@PreAuthorize("hasRole('ADMIN')")` en los endpoints administrativos. Ocultar el botón en Angular no es la medida de seguridad real; la autorización final la impone Spring Security.

### 8. ¿Cómo mantiene consistente el número de ejemplares?
Las operaciones de préstamo/devolución son transaccionales. Al prestar se valida disponibilidad y se decrementa en la misma transacción; al devolver se incrementa. Así la modificación del préstamo y del inventario se ejecutan juntas.

### 9. ¿Qué es una clave foránea?
Una restricción que garantiza que el identificador referenciado exista. `libros.author_id` debe existir en `autores`, y `prestamos.book_id` debe existir en `libros`.

### 10. ¿Por qué PostgreSQL?
Porque el dominio es relacional y necesita integridad referencial, unicidad, restricciones y consultas consistentes. PostgreSQL ofrece estas características de forma robusta.

## Frontend — preguntas probables

### 1. ¿Cómo consume Angular la API?
Con `HttpClient`, encapsulado en `ApiService`. Cada método llama a un endpoint y devuelve un `Observable` tipado.

### 2. ¿Qué hace el interceptor?
Antes de enviar una petición obtiene el JWT almacenado en la sesión y añade automáticamente el header `Authorization`. Así no se repite esa lógica en cada componente.

### 3. ¿Qué hace un guard?
Controla si se puede activar una ruta. `authGuard` exige autenticación y `adminGuard` además exige rol ADMIN. Es una protección de navegación/UX; la seguridad definitiva sigue estando en el backend.

### 4. ¿Cómo se realizan las validaciones?
Los formularios Angular aplican `required`, longitudes, tipo email, mínimos y máximos. El botón se desactiva si el formulario es inválido. Después, el backend vuelve a validar con Bean Validation.

### 5. ¿Cómo sabe el frontend qué botones mostrar?
`AuthService` mantiene la sesión y expone `isAdmin()`. Las plantillas usan `*ngIf="auth.isAdmin()"` para mostrar u ocultar opciones administrativas.

### 6. ¿Los datos están simulados?
No. Las listas se cargan desde la API. Incluso los datos iniciales son insertados por el backend en PostgreSQL y después Angular los consulta por HTTP.

### 7. ¿Qué pasa al recargar la página?
La respuesta de autenticación se guarda en `localStorage`. `AuthService` recupera esa sesión al iniciar la aplicación para conservar el token. Cerrar sesión elimina ese dato.

### 8. ¿Cómo implementó diseño responsivo?
La hoja global usa CSS Grid/Flexbox y media queries. En pantallas pequeñas la navegación y los formularios cambian a una columna y las tablas conservan scroll horizontal.

## Frases que conviene evitar

- No decir: “Angular protege mi API”. Angular solo controla la interfaz; Spring Security protege la API.
- No decir: “JWT encripta todo”. El JWT está firmado; HTTPS sería quien protege el transporte en producción.
- No decir: “JPA es la base de datos”. JPA es la abstracción ORM; PostgreSQL es la base de datos.
- No decir: “Repository hace las validaciones”. Las reglas principales están en Service y las restricciones también se refuerzan en DB/Bean Validation.
