# GestionDocentesAPI

Base de datos PostgreSQL: **gestion_docentes**

```sql
CREATE DATABASE gestion_docentes;
```

Ejecutar:
```bash
mvn clean spring-boot:run
```

Swagger: http://localhost:8080/swagger-ui.html

Administrador inicial:
- correo: `admin@docentes.com`
- contraseña: `Admin123*`

Por seguridad las credenciales de Gmail no están guardadas en Git. Por defecto `MAIL_ENABLED=false` y el código de verificación se imprime en la terminal. Para correo real configure `MAIL_ENABLED=true`, `MAIL_USERNAME` y `MAIL_PASSWORD` como variables de entorno.
