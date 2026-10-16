# RutaControl Premium — Gestión de Transporte

Aplicación web completa para administrar vehículos, conductores, rutas, viajes y usuarios. Frontend responsive, backend Node.js/Express y PostgreSQL.

## ⚡ Inicio rápido en Windows

**Si ya configuraste el proyecto anterior:** coloca los archivos de este ZIP dentro de tu repositorio actual `C:\Users\santa\examenInterciclo\examenInterciclo`, reemplazando los archivos de igual nombre. **No elimines `backend/.env` ni la carpeta `.git`.** Este ZIP no contiene `.env` ni contraseñas, por lo que tu configuración local se conservará.

Desde PowerShell, puedes actualizarlo directamente desde Descargas sin crear carpetas duplicadas:

```powershell
cd "C:\Users\santa\examenInterciclo\examenInterciclo"
Expand-Archive -LiteralPath "$HOME\Downloads\RutaControl_Premium_Examen20.zip" -DestinationPath . -Force
.\INICIAR.cmd
```

También puedes ejecutar `INICIAR.cmd` con doble clic desde el Explorador de archivos.

**¿Qué hace `INICIAR.cmd`?** Verifica Node.js, reutiliza tu `.env` si ya existe, instala las dependencias faltantes, crea la base `gestion_transporte` si es necesaria, aplica el esquema SQL, añade registros de muestra sin duplicados, crea el primer administrador si todavía no existe, inicia el servidor y abre `http://localhost:3000`.

Si todavía no tienes `.env`, el iniciador te preguntará una sola vez el puerto y la contraseña de PostgreSQL, así como el nombre, correo y contraseña de administrador. Las contraseñas no aparecen en pantalla, y `.env` está excluido por `.gitignore`.

**Requisitos:** Node.js 20 o superior, PostgreSQL en ejecución (usuario `postgres` con permiso para crear bases), Windows 10/11. pgAdmin es útil para inspeccionar las tablas, pero no necesitas crear manualmente las tablas.

**Para detener el servidor:** presiona `Ctrl + C` en la terminal del iniciador. No es necesario volver a configurar `.env` la próxima vez.

### Verificación

- Salud de la API: `http://localhost:3000/api/health`
- Pruebas unitarias: desde `backend`, `npm test`
- Prueba HTTP de integración: con la web encendida, desde otra terminal dentro de `backend`, `npm run test:api`
- Rama individual: `estudiante-20-geovanny-santacruz` (usa tu repositorio GitHub existente, sin borrar `.git`)

**Importante:** el ZIP no incluye archivos secretos ni la carpeta `node_modules`. Si publicas el repositorio, verifica que `git status` no muestre `.env`.

---

## Estructura

```text
GestionTransporte_Examen/
├── backend/
│   ├── src/
│   │   ├── middleware/      # JWT y permisos
│   │   ├── routes/          # Recursos API separados
│   │   ├── validators/      # Validaciones centralizadas
│   │   ├── app.js           # Configuración Express
│   │   ├── db.js            # Pool PostgreSQL
│   │   ├── errors.js        # Manejo de errores
│   │   └── server.js        # Arranque de servicio
│   ├── scripts/             # SQL, alta inicial y pruebas HTTP
│   ├── tests/               # Pruebas de validación
│   ├── .env.example         # Variables de ejemplo
│   └── package.json
├── database/
│   ├── 00_crear_base.sql
│   ├── 01_esquema.sql
│   └── 02_datos_prueba.sql
├── frontend/
│   ├── css/styles.css
│   ├── js/api.js
│   ├── js/app.js
│   ├── js/config.js
│   ├── js/ui.js
│   └── index.html
├── docs/
│   ├── analisis.md
│   ├── api.md
│   ├── pruebas.md
│   └── diagramas/
│       ├── modelo-conceptual.png / .svg / .dot
│       └── modelo-relacional.png / .svg / .dot
├── .gitignore
└── README.md
```

## Instalación en Windows (PowerShell y pgAdmin)

**Requisitos:** Node.js 20 o superior, PostgreSQL en ejecución, pgAdmin 4 y Visual Studio Code. Git es opcional para ejecución y necesario para publicar avances.

### 1. Incorporar archivos a tu rama

Si estás trabajando en un repositorio existente, copia **el contenido de este proyecto** (las carpetas `backend`, `database`, `docs`, `frontend` y los archivos `README.md`, `.gitignore`) a la **raíz del repositorio correcto**. No copies una carpeta `GestionTransporte_Examen` dentro de otra por accidente. No reemplaces la carpeta `.git` de tu repositorio.

### 2. Crear la base de datos

1. Abre pgAdmin 4, conéctate a PostgreSQL e ingresa la contraseña que configuraste al instalarlo.
2. Selecciona la base de datos **postgres** y abre **Query Tool**.
3. Ejecuta el contenido de `database/00_crear_base.sql`. Si ya existe `gestion_transporte`, omite esta instrucción.
4. Comprueba que aparece `gestion_transporte` en Databases (Refresh).

Alternativa: clic derecho en **Databases** → **Create** → **Database** → nombre `gestion_transporte` → Save.

### 3. Instalar backend y configurar conexión

Abre una terminal dentro de `backend` (no dentro de `frontend`) y ejecuta:

```powershell
npm install
Copy-Item .env.example .env
```

Abre `backend/.env` y completa estos valores:

```dotenv
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestion_transporte
DB_USER=postgres
DB_PASSWORD=TU_CONTRASENA_REAL_DE_POSTGRES
JWT_SECRET=COLOCA_UN_SECRETO_ALEATORIO_DE_AL_MENOS_32_CARACTERES
ADMIN_NOMBRE=Administrador Transporte
ADMIN_EMAIL=admin@transporte.local
ADMIN_PASSWORD=TU_CLAVE_SEGURA_DE_8_A_72_CARACTERES
```

Para generar un secreto JWT aleatorio en la terminal:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copia la cadena producida en `JWT_SECRET`. **No incluyas comillas ni el resultado en capturas públicas; no subas `.env` a GitHub.** Si tu servidor utiliza otro puerto, reemplaza `DB_PORT` por el que aparece en pgAdmin.

### 4. Crear tablas, registrar datos de demostración y administrador

**Desde `backend`:**

```powershell
npm run db:setup
npm run db:demo
npm run crear-admin
```

`db:setup` ejecuta `database/01_esquema.sql` con tablas, claves, restricciones e índices. `db:demo` agrega tres vehículos, tres conductores y tres rutas ficticias; no crea viajes de forma automática. `crear-admin` registra una cuenta segura con correo y clave definidos en `.env`.

Si prefieres pgAdmin, en Query Tool de `gestion_transporte` ejecuta `01_esquema.sql`, y luego `02_datos_prueba.sql`. **No ejecutes simultáneamente ambas alternativas**: los scripts están preparados para evitar registros duplicados, pero basta con una opción.

### 5. Ejecutar la aplicación

Desde `backend`:

```powershell
npm start
```

Abre **http://localhost:3000** en el navegador. Ingresa con `ADMIN_EMAIL` y `ADMIN_PASSWORD` configurados anteriormente. No abras `frontend/index.html` con doble clic: la aplicación necesita la API REST y debe servirse por HTTP.

Para reinicio automático cuando cambia el backend: `npm run dev`.

### 6. Verificar funcionamiento

Con `npm start` ejecutándose:

- **http://localhost:3000/api/health** devuelve `{"estado":"ok","backend":"conectado","base_de_datos":"conectada"}` si el backend y PostgreSQL funcionan.
- Desde el panel, crea/edita/elimina un vehículo, conductor y ruta, y consulta esos cambios en pgAdmin.
- Programa un viaje asignando los tres registros. Comprueba que un horario superpuesto produce error y que la información persiste al recargar.
- Desde **Usuarios**, registra un operador: puede consultar catálogos y crear/editar viajes, pero no administrar catálogos ni cuentas.

Pruebas automatizadas de validaciones (no requieren servidor ni PostgreSQL, pero sí `npm install`):

```powershell
npm test
```

Prueba de extremos HTTP de la API (requiere servidor y PostgreSQL activos):

```powershell
npm run test:api
```

La prueba de API crea registros temporales y los elimina al terminar. Requiere las variables del administrador en `.env`.

## API REST

Todas las rutas, ejemplos HTTP, reglas y permisos están documentados en [docs/api.md](docs/api.md).

| Recurso | Endpoints principales |
| --- | --- |
| Sesión | `POST /api/auth/login`, `GET /api/auth/me` |
| Vehículos | `GET/POST /api/vehiculos`, `GET/PUT/DELETE /api/vehiculos/:id` |
| Conductores | `GET/POST /api/conductores`, `GET/PUT/DELETE /api/conductores/:id` |
| Rutas | `GET/POST /api/rutas`, `GET/PUT/DELETE /api/rutas/:id` |
| Viajes | `GET/POST /api/viajes`, `GET/PUT/DELETE /api/viajes/:id` |
| Usuarios | `GET/POST /api/usuarios`, `GET/PUT/DELETE /api/usuarios/:id` |
| Resumen | `GET /api/resumen` |

Todas las rutas protegidas exigen `Authorization: Bearer <JWT>`. Los SQL utilizan parámetros, no interpolan datos del visitante en sus instrucciones.

## Diagramas de base de datos

- [Modelo E-R conceptual (notación Chen)](docs/diagramas/modelo-conceptual.png)
- [Modelo de tablas y relaciones](docs/diagramas/modelo-relacional.png)

También se incluyen SVG vectoriales y archivos `.dot` de origen para poder modificar los diagramas.

## Guardar avances en Git

Desde la raíz **del repositorio donde tengas `.git`**, en la rama individual correcta:

```powershell
git status
git add .
git commit -m "Sistema de gestion de transporte completo"
git push -u origin estudiante-20-geovanny-santacruz
```

Antes del commit, comprueba con `git status` que **no** aparece `backend/.env`, carpetas `node_modules` o contraseñas. `.gitignore` ya los excluye.

## Solución de errores frecuentes

| Mensaje | Qué revisar |
| --- | --- |
| `password authentication failed for user postgres` | `DB_USER` / `DB_PASSWORD` en `.env` |
| `ECONNREFUSED 127.0.0.1:5432` | Servicio PostgreSQL iniciado, `DB_HOST` y `DB_PORT` correctos |
| `database "gestion_transporte" does not exist` | Crear primero la base de datos desde pgAdmin |
| `relation "usuarios" does not exist` | Ejecutar `npm run db:setup` |
| `Configura JWT_SECRET seguro` | Sustituir la variable JWT por una clave aleatoria |
| `EADDRINUSE: address already in use :::3000` | Cerrar la otra instancia o cambiar `PORT` |
| `No se pudo conectar con el servidor` | Iniciar el backend con `npm start` y abrir `http://localhost:3000` |
| Error 403 al editar catálogos | El usuario es `operador`; se requiere `admin` |
| Error 409 por viaje superpuesto | Cambiar vehículo, conductor u horario; el conflicto es intencional |

## Notas de seguridad

En desarrollo local puede usarse HTTP en `localhost`. Para publicar en Internet son necesarios HTTPS, una configuración de despliegue segura y un proveedor de base de datos protegido. Los tokens permanecen en `sessionStorage` del navegador y se descartan al cerrar la pestaña. La API verifica el usuario activo en cada petición autenticada.


## Validación adicional de integridad referencial

Antes de eliminar un vehículo, conductor o ruta, la API consulta si está
referenciado por algún viaje. En ese caso responde **HTTP 409** con un mensaje
explicativo. PostgreSQL continúa siendo la garantía de integridad y el manejador
de errores también transforma SQLSTATE `23503` en HTTP 409.
Para probarlo: `cd backend`, `npm test` y, con el servidor levantado,
`npm run test:api`.
