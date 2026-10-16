# Pruebas funcionales desde Angular

Antes: inicia PostgreSQL, backend 8080, frontend 4200 y crea el ADMIN con variables de entorno.

| Nº | Rol | Prueba en la página | Resultado esperado |
|---|---|---|---|
| 1 | Anónimo | Registrar operador | Se crea cuenta OPERADOR |
| 2 | Operador | Iniciar sesión | Abre panel Solicitudes |
| 3 | Operador | Crear solicitud | Se guarda con estado PENDIENTE |
| 4 | Operador | Editar solicitud pendiente | Se actualiza al recargar |
| 5 | Operador | Consultar solicitudes | Solo ve las propias |
| 6 | Operador | Eliminar solicitud pendiente | Desaparece del listado |
| 7 | Operador | Intentar entrar a Ambulancias | El botón se encuentra deshabilitado |
| 8 | Admin | Iniciar sesión | Se muestran cuatro módulos |
| 9 | Admin | Crear ambulancia DISPONIBLE | Aparece en tabla |
| 10 | Admin | Editar datos ambulancia | Cambios persistidos |
| 11 | Admin | Crear conductor DISPONIBLE | Aparece en tabla |
| 12 | Admin | Crear asignación sobre solicitud pendiente | Se crea EN_CURSO, recursos OCUPADOS |
| 13 | Admin | Finalizar asignación | Solicitud FINALIZADA, recursos DISPONIBLES |
| 14 | Admin | Eliminar asignación terminada | Se elimina asignación |
| 15 | Admin | Eliminar ambulancia sin referencias | Se elimina o backend impide borrar si está referenciada |
| 16 | Ambos | Contraseña incorrecta | Error visible, sin bloqueo de botón |
| 17 | Ambos | Detener backend y consultar | Error de conexión visible |

Captura: login, CRUD, formulario, tablas, consulta posterior, roles y mensajes de error. No uses datos simulados.
