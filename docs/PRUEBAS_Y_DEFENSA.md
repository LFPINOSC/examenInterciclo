# Práctica y defensa

## Antes de comenzar
MariaDB activo, backend 8083, Angular 4201. Abre navegador normal para ADMIN y ventana de incógnito para USUARIO. La sesión está en sessionStorage. No dupliques una pestaña con la sesión abierta. Ten a mano la clave ADMIN local; no la proyectes ni la incluyas en GitHub.

## Recorrido completo desde la web
1. ADMIN: ingresa con admin@reservas.local. Explica que el menú muestra Hoteles, Tipos y Usuarios por el rol.
2. Hotel: crea `Hotel Examen`, ciudad Cuenca, dirección Centro, descripción de prueba. Consulta su fila, edita la descripción y guarda. Para evidenciar DELETE puedes crear un hotel temporal sin habitaciones y eliminarlo.
3. Tipo: crea `Examen Doble`, consulta, edita descripción. Crea y elimina otro tipo temporal sin habitaciones.
4. Habitaciones: Nueva habitación, selecciona Hotel Examen y Examen Doble, número 301, USD 50, capacidad 2, habilitada. Guarda y edita tarifa a USD 60. Crea y elimina una habitación temporal sin reservas.
5. Ventana privada: Crear cuenta, nombre y correo de prueba (no se envía correo), contraseña de al menos 10 caracteres con mayúscula/minúscula/número. Ejemplo solo para práctica: PracticaHotel2026! Ingresa. No aparecen opciones administrativas.
6. Busca disponibilidad para dos fechas FUTURAS separadas por dos noches, dos huéspedes. Reserva la habitación 301. Total esperado USD 120. El servidor calcula el importe.
7. Mis reservas: consulta los datos y cambia la salida a tres noches. Total esperado USD 180 si la tarifa sigue en 60. Recarga la página: el cambio persiste.
8. Intenta reservar la misma habitación con fechas superpuestas: debe mostrar conflicto. Prueba salida igual a entrada, fecha pasada y exceso de capacidad. Las validaciones también existen en Java.
9. ADMIN: actualiza Reservas. Ve la reserva del usuario. USUARIO solo ve las suyas. En una segunda cuenta USUARIO no puedes consultar o modificar la reserva anterior.
10. ADMIN: desactiva la cuenta de prueba desde Usuarios. En la ventana USER pulsa Mis reservas: al hacer una nueva solicitud se revoca la sesión. Activa otra vez e inicia sesión de nuevo. No es una notificación instantánea: se detecta en la siguiente petición.
11. USER: cancela su reserva. Las fechas vuelven a estar disponibles. Después pulsa Eliminar para demostrar DELETE. Eliminar y cancelar son acciones diferentes.
12. ADMIN: elimina habitación 301; después hotel y tipo de prueba. Si existen reservas relacionadas, primero cancélalas y elimínalas. No borres datos ajenos.
13. Cierra sesión. Intenta escribir /reservas en la dirección del navegador: el guard devuelve al login.

## Cómo demostrar la integración
F12 → Network/Red → Fetch/XHR. Guarda una operación. Muestra URL, método HTTP, cuerpo JSON y respuesta (oculta Authorization). En DBeaver ejecuta:
```sql
SELECT id,nombre,ciudad FROM hoteles;
SELECT id,hotel_id,tipo_id,numero,precio_noche FROM habitaciones;
SELECT id,usuario_id,habitacion_id,entrada,salida,total,estado FROM reservas;
SELECT id,nombre,email,rol,activo FROM usuarios;
```
No consultes password_hash en una proyección pública. El GET health no sustituye estas pruebas de almacenamiento.

## Ruta para explicar backend
1. `controller/HabitacionController.java`: rutas REST; GET consulta, POST registra, PUT modifica, DELETE elimina. @PreAuthorize limita escritura a ADMIN.
2. `dto/Datos.java`: @NotBlank, @Email, @Min y @DecimalMin. @Valid en el controlador activa las validaciones.
3. `service/ReservaService.java`: reglas de fechas, capacidad, propiedad y cálculo; @Transactional agrupa consulta/bloqueo/escritura.
4. `repository/Consultas.java`: JdbcTemplate, SQL con ? y parámetros separados; no concatenamos los valores del usuario.
5. `security/JwtFilter.java`: obtiene Bearer, verifica firma y vigencia mediante JwtService y comprueba usuario activo/version.
6. `service/AuthService.java`: BCrypt encode al registrar y matches al iniciar sesión. Registro fuerza USUARIO.
7. `src/main/resources/application.properties`: conexión y configuración externa. La clave real vive en configuracion-local, excluida por .gitignore.

## Ruta para explicar Angular
1. `src/main.ts`: arranca componente raíz, router y HttpClient con interceptor.
2. `app.routes.ts`: login/registro públicos; authGuard para pantallas de usuario y adminGuard para catálogos/usuarios.
3. `core/guards.ts`: revisa sesión local y rol para navegar; no valida criptográficamente JWT.
4. `core/session.service.ts`: signals y sessionStorage con token/usuario. No almacena contraseña.
5. `features/booking-form.component.html`: formulario vinculado con ngModel; ngSubmit llama save().
6. `booking-form.component.ts`: recoge fechas/huéspedes y llama ApiService. El total mostrado es estimado; Java fija el definitivo.
7. `core/api.service.ts`: HttpClient construye GET/POST/PUT/PATCH/DELETE con base de environment.ts.
8. `core/api.interceptor.ts`: agrega token a solicitudes de la API y maneja 401.
9. `app.component.html`: navegación y router-outlet; Angular coloca allí la pantalla seleccionada.
10. `core/models.ts`: interfaces TypeScript describen respuestas; no crean tablas de base de datos.

## Preguntas típicas
- ¿Cuáles son las cuatro entidades fuera de roles? Hotel, TipoHabitacion, Habitacion y Reserva. Usuario también existe, pero no necesitamos contarlo para llegar a cuatro.
- ¿Qué relación hay? Hotel 1:N Habitacion; Tipo 1:N Habitacion; Usuario 1:N Reserva; Habitacion 1:N Reserva.
- ¿Por qué la habitación no tiene estado ocupado? Porque la ocupación depende del intervalo de fechas; activa solo indica si se permite reservarla.
- ¿Qué evita doble reserva? Verificación de superposición dentro de una transacción que bloquea la fila de habitación.
- ¿Qué diferencia hay entre 401 y 403? 401 falta sesión válida; 403 hay identidad pero no permiso.
- ¿Por qué frontend y backend validan? Frontend ayuda al usuario; backend es obligatorio porque pueden enviar solicitudes sin usar Angular.
- ¿Usas JPA? No, Spring JDBC. El esquema SQL define tablas y Consultas usa JdbcTemplate.
- ¿Qué cambió respecto a Postman? Los formularios llaman los mismos métodos HTTP automáticamente y el interceptor adjunta el JWT.
- ¿Qué son guards e interceptor? Guards controlan navegación; interceptor transforma solicitudes/respuestas HTTP.
- ¿Qué es un componente standalone? Declara sus dependencias en imports sin requerir AppModule.
- ¿Dónde se guardan datos? MariaDB. sessionStorage solo mantiene la sesión del navegador.

## Pruebas automáticas
`backend/mvnw.cmd test` ejecuta las pruebas de integración con H2 en modo MariaDB, sin modificar tu base real. Incluye CRUD, fechas, capacidad, superposición, concurrencia, propiedad, permisos y revocación. H2 no sustituye la comprobación final con tu instancia MariaDB desde la web.
