# Plan de pruebas y verificaciones

Las pruebas se realizan sobre la base real de PostgreSQL. El objetivo es demostrar operaciones CRUD, seguridad, integración y consistencia de datos.

## Pruebas manuales

| ID | Acción | Resultado esperado |
| --- | --- | --- |
| P01 | Iniciar sesión como administrador | Acceso al panel general y menús |
| P02 | Introducir credenciales incorrectas | 401 y mensaje de error, sin acceso |
| P03 | Crear vehículo con placa única | Se registra y aparece en tabla y PostgreSQL |
| P04 | Crear vehículo con placa repetida | 409, no crea duplicado |
| P05 | Editar marca/capacidad de vehículo | Información persistente tras recargar navegador |
| P06 | Eliminar vehículo sin viajes | Desaparece de tabla y PostgreSQL |
| P07 | Crear, editar y eliminar conductor | CRUD y validaciones correctas |
| P08 | Crear ruta con mismo origen y destino | Error 400 |
| P09 | Crear y editar ruta válida | Distancia persistente en PostgreSQL |
| P10 | Crear viaje con referencias existentes | Devuelve 201 y aparece en la tabla |
| P11 | Crear segundo viaje solapando conductor o vehículo | Error 409 con información del conflicto |
| P12 | Editar viaje y marcarlo finalizado | Nuevo estado visible y persistente |
| P13 | Eliminar vehículo asociado a viaje | Error 409 por integridad referencial |
| P14 | Crear usuario operador e iniciar sesión | Accede a catálogos de consulta y viajes |
| P15 | Operador intenta crear vehículo mediante API | Error 403 |
| P16 | Operador programa un viaje | Permitido con datos válidos |
| P17 | Usuario sin token solicita catálogos | 401 |
| P18 | Desactivar cuenta y reutilizar su token | 401 |
| P19 | Recargar el navegador con sesión activa | Los datos siguen en PostgreSQL |
| P20 | Abrir interfaz en móvil o reducir ancho | Menú lateral adaptable, tablas desplazables |

## Pruebas de validaciones

```powershell
cd backend
npm test
```

El conjunto `tests/validaciones.test.js` comprueba placa, capacidad, fechas, licencias, rutas, roles y contraseñas.

## Prueba HTTP automatizada

Con el backend en ejecución y las credenciales de administrador configuradas:

```powershell
cd backend
npm run test:api
```

El script `scripts/prueba-api.js` verifica la conexión, autenticación, operaciones CRUD, errores 403/409, integridad referencial, asignaciones sin solapamiento y resumen. Crea y elimina los registros temporales usados durante la prueba.

## Comprobación directa de la base de datos

En pgAdmin, conectado a `gestion_transporte`, Query Tool:

```sql
SELECT * FROM usuarios;
SELECT * FROM vehiculos;
SELECT * FROM conductores;
SELECT * FROM rutas;
SELECT * FROM viajes;
```

Las contraseñas aparecen únicamente como `password_hash`; nunca deben visualizarse como texto claro. Para comprobar relaciones:

```sql
SELECT v.id_viaje, c.nombres, ve.placa, r.origen, r.destino,
       v.fecha_salida, v.fecha_llegada_prevista, v.estado
FROM viajes v
JOIN conductores c ON c.id_conductor = v.id_conductor
JOIN vehiculos ve ON ve.id_vehiculo = v.id_vehiculo
JOIN rutas r ON r.id_ruta = v.id_ruta
ORDER BY v.id_viaje DESC;
```

## Fallos esperados y tratamiento

- `400` por campos faltantes, capacidad negativa, fechas mal formadas o llegada anterior a salida.
- `401` por JWT ausente, vencido o usuario desactivado.
- `403` por intentar administrar sin rol `admin`.
- `404` por solicitar registro inexistente.
- `409` por placa, licencia o correo duplicado; viajes solapados; eliminación que rompa FK.

El frontend muestra mensajes al usuario; el backend realiza validaciones independientemente de la interfaz, por lo que los controles siguen funcionando con clientes como Postman o PowerShell.
