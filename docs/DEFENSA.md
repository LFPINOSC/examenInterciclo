# Guía para la defensa — Control de Vacunación

Preguntas probables y cómo responderlas señalando el código. Practique abriendo cada archivo mientras explica.

---

## A. Base de datos

**¿Por qué estas 6 entidades?** (2 de seguridad + 4 del negocio)
Porque cada una tiene datos propios y un ciclo de vida independiente: el paciente existe aunque no se vacune; la vacuna es un catálogo con reglas (dosis, intervalo, edad); el lote es inventario físico con caducidad y stock; la aplicación es el evento clínico; el usuario es quien opera el sistema y el rol define qué puede hacer. Si mezclara vacuna y lote en una tabla repetiría el nombre y las reglas en cada lote.

**¿Por qué `roles` es una tabla y no un campo de texto en `usuarios`?**
Para no repetir el nombre del rol en cada usuario (normalización), poder describir cada rol y que la FK `usuarios.rol_id` impida asignar un rol inexistente. El login hace `JOIN roles` y guarda el nombre del rol dentro del JWT; el middleware `autorizar('ADMIN')` compara ese nombre. Por eso la API de roles es de solo lectura: un rol nuevo creado desde la interfaz no tendría permisos programados.

**¿Por qué `aplicaciones` apunta al lote y no a la vacuna?**
Trazabilidad: si el MSP retira un lote, sé exactamente qué pacientes lo recibieron. Y la vacuna se deduce por `lotes.vacuna_id`, así que guardar `vacuna_id` también sería redundante (violaría 3FN) y podría quedar inconsistente.

**¿Por qué `id` autoincremental y no la cédula como PK?**
La cédula es clave candidata (`UNIQUE`). Un id entero es más pequeño para las FK y permite corregir una cédula mal digitada sin tocar las tablas relacionadas.

**¿Por qué `ON DELETE RESTRICT`?**
Es historial clínico: no se debe perder. Si intento borrar un paciente con dosis, MySQL lanza `ER_ROW_IS_REFERENCED_2` y la API responde 409 (`errorHandler.js`). Para usuarios se ofrece *desactivar* en lugar de eliminar.

**¿Qué normalización cumple?** 3FN: cada atributo depende solo de la PK de su tabla; no hay grupos repetidos ni dependencias transitivas.

---

## B. Backend y API REST (2 preguntas en la defensa)

**¿Qué es REST y cómo lo aplicó?**
Recursos identificados por URL en plural (`/pacientes`, `/lotes`) y la operación la indica el verbo HTTP: GET consultar, POST crear, PUT actualizar, DELETE eliminar. Es *stateless*: cada petición lleva su token, el servidor no guarda sesión. Respondo con códigos correctos: 201 al crear, 204 al eliminar, 400/401/403/404/409 en errores. Ver `backend/src/routes/index.js`.

**Explique el flujo de una petición** (ej. `POST /api/aplicaciones`):
`app.js` → `express.json()` convierte el cuerpo → `routes/index.js` → middleware `autenticar` verifica el JWT → `aplicaciones.controller.crear` valida y aplica reglas → MySQL → respuesta JSON. Si algo falla, el error llega a `errorHandler.js`, que responde con formato uniforme.

**¿Por qué usó una transacción al registrar una vacuna?** (`aplicaciones.controller.js`, función `crear`)
Registrar la dosis y descontar el stock son dos operaciones que deben ocurrir juntas (atomicidad). Si falla la segunda, `rollback()` deshace la primera. Además `SELECT ... FOR UPDATE` bloquea la fila del lote: si dos enfermeras usan la última dosis a la vez, la segunda espera y ve stock 0 (evita condición de carrera).

**¿Por qué el número de dosis lo calcula el servidor?**
Porque el cliente no es confiable. El servidor cuenta las dosis previas de esa vacuna para ese paciente, valida intervalo, edad y esquema, y calcula `proxima_dosis`.

**¿Cómo implementó la seguridad?**
- `bcrypt.hash` al crear usuarios y `bcrypt.compare` en el login (`auth.controller.js`). Un hash no se puede revertir; bcrypt agrega *salt* y es lento a propósito contra fuerza bruta.
- `jwt.sign` genera el token con id, nombre y rol, firmado con `JWT_SECRET` y expiración. `autenticar` lo verifica con `jwt.verify`; `autorizar('ADMIN')` revisa el rol (`middleware/auth.js`).
- 401 = no autenticado; 403 = autenticado pero sin permiso.

**¿Cómo evita la inyección SQL?**
Con consultas parametrizadas: `pool.query('SELECT ... WHERE id = ?', [id])`. `mysql2` escapa el valor; nunca concateno texto del usuario en el SQL.

**¿Qué es el pool de conexiones?** (`config/db.js`) Mantiene hasta 10 conexiones abiertas y las reutiliza, en lugar de abrir/cerrar una por petición.

**¿Qué es CORS y por qué lo activó?** El navegador bloquea peticiones a otro origen (p. ej. Live Server en :5500 → API en :3000). `app.use(cors())` envía las cabeceras que lo permiten.

**¿Para qué sirve el archivo `.env`?** Para no escribir credenciales (contraseña de MySQL, `JWT_SECRET`) en el código ni subirlas a GitHub (`.gitignore` lo excluye).

---

## C. Frontend (2 preguntas en la defensa)

**¿Cómo se conecta el frontend con el backend?** (`frontend/js/api.js`)
Una sola función `api(ruta, { metodo, datos })` usa `fetch`, agrega `Authorization: Bearer <token>`, envía JSON y, si la respuesta no es 2xx, lanza un error con el mensaje y los `detalles` de la API para mostrarlos en el formulario. Si recibe 401, cierra la sesión y vuelve al login.

**¿Dónde guarda el token y por qué?** En `sessionStorage`: se borra al cerrar la pestaña, así no queda la sesión abierta en un computador compartido del centro de salud.

**¿Qué validaciones hace el frontend?** (`utils.js` → `validarFormulario`)
1. Atributos HTML5: `required`, `pattern`, `min/max`, `type="email"`, `type="date"` con `max=hoy`.
2. Reglas propias: cédula con algoritmo módulo 10 (en vivo mientras escribe), representante obligatorio si es menor de edad, caducidad posterior al ingreso, contraseña segura.
3. Los campos inválidos se marcan en rojo y se lista cada error. El frontend valida para dar respuesta rápida al usuario; el backend vuelve a validar porque es la única capa confiable.

**¿Cómo funciona la navegación sin recargar?** (`js/app.js`)
Es una SPA sencilla: escucha el evento `hashchange` (`#/pacientes`, `#/vacunas`...), importa el módulo correspondiente y llama a su función `render`, que pinta en `<main>`.

**¿Cómo evita XSS?** Todo dato que viene de la API pasa por `esc()` antes de insertarse con `innerHTML`, convirtiendo `<`, `>`, `"`… en entidades HTML.

**¿Qué es la delegación de eventos?** En cada tabla hay *un* listener en `<tbody>` que detecta qué botón se pulsó con `e.target.closest('button[data-accion]')`. Funciona aunque las filas se regeneren después de cada carga.

**¿Qué pasa al registrar una vacuna en la interfaz?** (`modulos/aplicaciones.js`)
Al elegir la vacuna se piden a la API solo los lotes vigentes con stock (`/lotes?vacuna_id=X&vigentes=1`); al elegir paciente y vacuna se consulta el carnet para mostrar "Se registrará la dosis N de M" y la fecha sugerida. Al guardar se hace `POST /aplicaciones`; si la API responde 409 (p. ej. intervalo no cumplido), el mensaje aparece dentro del modal.

**¿Por qué no usó un framework?** El objetivo era demostrar el consumo de la API con JavaScript estándar (`fetch`, módulos ES, DOM). La organización por módulos (`modulos/*.js`) y componentes reutilizables (`modal.js`, `api.js`) sigue la misma idea que un framework.

---

## D. Demostración sugerida (5 minutos)
1. Login como ADMIN → panel con próximas dosis atrasadas y alertas de lotes.
2. Pacientes → crear uno con cédula inválida (ver error) → corregir → guardar.
3. "Vacunar" a Mateo Guamán: Pentavalente → muestra dosis 3 de 3 → registrar → stock baja en Lotes.
4. Intentar de nuevo la misma vacuna → 409 "ya completó el esquema".
5. Abrir el carnet → esquema completo.
6. Cerrar sesión, entrar como enfermería → no ve "Usuarios" ni botones de eliminar.
7. Mostrar en `docs/pruebas.http` una petición sin token → 401.
