# Estancia — Reservas hoteleras

Proyecto de Danny Salazar. Java + Spring Boot, Angular y MariaDB. Una API REST con capas controller, service y repository; un frontend independiente. Sin Gmail, sin pagos electrónicos ni servicios externos.

## Inicio rápido en Windows
1. Conserva tu repositorio `examenInterciclo` y su carpeta `.git`. Copia dentro **el contenido** de esta entrega: backend, frontend, database, docs, scripts, .gitignore y archivos CMD. No copies una carpeta anidada adicional ni otro repositorio. Reemplaza el .gitignore anterior.
2. Debes tener MariaDB encendido, base `reservas_hoteleras_db` y usuario `reservas_app` con permisos sobre ella, como ya preparaste en DBeaver. Java 17 o 21 y Node 24. Maven global no es necesario: se incluye el Wrapper oficial.
3. Ejecuta `CONFIGURAR.cmd`. Introduce la contraseña de MariaDB. Genera una clave JWT y una contraseña ADMIN aleatorias, guardadas solo en `configuracion-local/application-local.properties`.
4. Ejecuta `COMPILAR_Y_PROBAR.cmd`. Necesita Internet para descargar Maven y dependencias; después compila ambas partes y ejecuta las pruebas backend. No inicia la web.
5. Ejecuta `INICIAR_BACKEND.cmd`. Al iniciar se crean las tablas y se cargan dos hoteles, tres tipos y cinco habitaciones reales en MariaDB. **No ejecutes el script de Cocina Cero.** El esquema SQL de esta entrega también está en `database/schema.sql`.
6. Comprueba `http://localhost:8083/api/health`: debe indicar OK. Esto prueba disponibilidad del servicio; el CRUD confirma el almacenamiento.
7. Ejecuta `INICIAR_FRONTEND.cmd`. Abre `http://127.0.0.1:4201`. Mantén las dos ventanas abiertas.
8. ADMIN: `admin@reservas.local`. Consulta su contraseña en la propiedad `app.admin-password` del archivo local. Registra otra cuenta desde la web para probar USUARIO.

## Datos y configuración
- Cada nueva cuenta es USUARIO, activa inmediatamente. Las contraseñas se guardan con BCrypt. No hay verificación de correo ni aprobación administrativa obligatoria en este examen.
- ADMIN administra catálogos, todas las reservas y activación/desactivación de usuarios. USUARIO solo modifica sus reservas.
- El rol es un atributo restringido de usuarios, no una entidad adicional. Cuatro entidades del negocio: Hotel, TipoHabitacion, Habitacion y Reserva. Usuario es la quinta. `inicializacion` es una tabla técnica, no una entidad del negocio.
- Una reserva es de una habitación, para uno o más huéspedes, con intervalo [entrada,salida). Puede entrar un huésped el mismo día en que otro sale.
- JWT dura una hora. Logout y desactivación revocan los tokens mediante `token_version`. El backend consulta el usuario actual en cada solicitud protegida.
- Cambiar `app.admin-password` después de crear ADMIN NO cambia su contraseña en la base. El script de configuración conserva archivos existentes.
- `schema.sql` utiliza CREATE TABLE IF NOT EXISTS, no migra cambios futuros de columnas. No elimina datos. Los datos iniciales se cargan una sola vez.
- Precios en USD. El total se calcula en el servidor: noches × tarifa. La tarifa se guarda en la reserva y no cambia si posteriormente editas la habitación; al editar una reserva se aplica la tarifa vigente.
- Desactivar una habitación impide nuevas reservas y modificaciones de fechas; no cancela automáticamente las existentes.
- No hay JPA/Hibernate en este proyecto: se usa Spring JDBC (`JdbcTemplate`) con SQL parametrizado. El esquema SQL define PK, FK, UNIQUE y CHECK.

## Archivos clave
- `backend/src/main/java/com/danny/reservas/controller`: endpoints.
- `service`: reglas de negocio y transacciones.
- `repository/Consultas.java`: consultas parametrizadas y claves generadas. Los nombres de tablas en borrar se reciben únicamente de constantes internas, nunca del usuario HTTP.
- `security`: firma JWT, filtro y permisos HTTP.
- `dto/Datos.java`: validación de solicitudes.
- `frontend/src/app/features`: pantallas Angular.
- `frontend/src/app/core`: servicios HTTP, sesión, guards, interceptor y modelos.
- `frontend/src/app/app.routes.ts`: rutas de la web.
- `frontend/src/environments/environment.ts`: URL de la API.
- `docs/DISENO.md`, `docs/PRUEBAS_Y_DEFENSA.md`: explicación y recorrido.

## Git: publicar únicamente tu rama
Desde la raíz `examenInterciclo`:
```powershell
git branch --show-current
git status
git check-ignore configuracion-local/application-local.properties
git add .
git diff --cached --stat
git diff --cached --name-only
```
Comprueba que estás en `estudiante-danny-salazar` y que NO aparecen contraseñas, configuracion-local, node_modules, target ni dist. Es normal que aparezcan eliminados los archivos anteriores de órdenes de trabajo.
```powershell
git commit -m "Implementar reservas hoteleras con Spring Boot y Angular"
git push -u origin estudiante-danny-salazar
```
Para cambios posteriores: `git add .`, `git commit -m "Corregir validaciones"`, `git push`. No hagas push a main ni uses --force. Si Git solicita identidad, configura tu nombre y el correo asociado a GitHub con `git config user.name "Danny Salazar"` y `git config user.email "TU_CORREO"` dentro del repositorio. No incluyas tokens en la URL.

## Fallos comunes
- Access denied: verifica contraseña local de reservas_app y permisos en DBeaver.
- Port already in use: cierra la instancia anterior; esta entrega usa 8083 y 4201 para no ocupar los puertos de Cocina Cero.
- No conecta la web: revisa API 8083, MariaDB y `environment.ts`. CORS admite localhost y 127.0.0.1 en 4201.
- 409 al borrar: existen registros relacionados o un duplicado. Cancela y elimina primero las reservas de prueba, luego habitación, hotel y tipo.
- PowerShell no reconoce mvn: usa los CMD incluidos o `backend\mvnw.cmd`; no necesitas Maven global.
- La primera compilación requiere conexión con Maven Central y npm.

## Referencias técnicas
https://angular.dev/reference/versions
https://docs.spring.io/spring-boot/3.5/system-requirements.html
