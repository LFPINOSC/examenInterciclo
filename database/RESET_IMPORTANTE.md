# Reinicio limpio de PostgreSQL

El primer borrador del proyecto insertaba dos libros de demostración automáticamente. El proyecto corregido ya **no** lo hace.

Si ya ejecutaste el borrador anterior, esos registros siguen físicamente en PostgreSQL aunque cambies el código. Para comenzar el examen con el catálogo vacío:

1. Detén Spring Boot (`Ctrl+C`).
2. Desde la raíz del proyecto ejecuta:

```bash
./scripts/reset_database.sh
```

3. Escribe `REINICIAR` cuando lo solicite.
4. Inicia nuevamente el backend:

```bash
cd backend
mvn spring-boot:run
```

Se crearán únicamente las cuentas:

- `admin` / `Admin123*`
- `lector` / `Lector123*`

No se crean autores, categorías, libros ni préstamos automáticamente.
