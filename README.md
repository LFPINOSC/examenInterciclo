# Examen interciclo — hospitalización

Proyecto del examen: registrar pacientes, asignar habitación y llevar el ingreso hasta el alta.  
Stack: Angular (frontend), Node con Express (API) y SQLite.

**Estudiante:** Jean Pierre — código 08  
**Rama:** `estudiante-08-jean-pierre`

## Requisitos

- Node.js 22

## Arranque

```bash
npm run install:all
npm start
```

Luego abrir http://localhost:3000 (el backend compila Angular y sirve todo desde el puerto 3000).

Para volver a los datos del seed:

```bash
npm run reset
npm start
```

## Cuentas del seed

| Correo | Clave | Rol |
|--------|-------|-----|
| admin@hospital.local | Admin123 | Administrador |
| recepcion@hospital.local | Recepcion123 | Recepción |
| medico@hospital.local | Medico123 | Médico (Ana Torres) |

Recepción y admin pueden crear pacientes e ingresos. El médico solo ve hospitalizaciones donde él aparece como responsable y puede actualizar diagnóstico u observaciones y dar el alta.

## Base de datos

El modelo está en `database/schema.sql`. Son cuatro tablas:

- `usuarios` — login y rol (ADMIN, MEDICO, RECEPCION)
- `pacientes`
- `habitaciones`
- `hospitalizaciones` — une paciente y cama; el médico va como texto en `medico_responsable`

La API usa JWT después del login. Las rutas validan el rol según corresponda.
