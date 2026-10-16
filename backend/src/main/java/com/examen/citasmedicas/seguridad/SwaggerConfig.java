package com.examen.citasmedicas.seguridad;

// Permiten configurar componentes de Spring Boot.
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// Permiten personalizar la documentacion OpenAPI.
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

// Permiten documentar la autenticacion HTTP Basic.
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;

/**
 * ==========================================
 * CONFIGURACION DE SWAGGER
 * SISTEMA DE CONTROL DE CITAS MEDICAS
 * ==========================================
 *
 * Esta clase configura la documentacion
 * interactiva de nuestra API REST.
 *
 * Swagger permitira:
 *
 * 1. Visualizar todos los endpoints REST.
 * 2. Probar GET, POST, PUT y DELETE.
 * 3. Enviar solicitudes JSON.
 * 4. Consultar respuestas y codigos HTTP.
 * 5. Autenticarse mediante HTTP Basic.
 *
 * En el futuro, si cambiamos a JWT,
 * tambien actualizaremos esta configuracion.
 */
@Configuration
public class SwaggerConfig {

    /**
     * Define la informacion general de la API
     * y el mecanismo de autenticacion.
     *
     * @Bean permite que Spring registre
     * automaticamente la configuracion.
     */
    @Bean
    public OpenAPI configurarSwagger() {

        return new OpenAPI()

            // Informacion visible en Swagger UI.
            .info(new Info()
                .title("API - Control de Citas Medicas")
                .version("1.0.0")
                .description(
                    "API REST para administrar pacientes, "
                    + "medicos, citas medicas y usuarios. "
                    + "Desarrollada con Spring Boot y PostgreSQL."
                )
            )

            // Registrar autenticacion HTTP Basic.
            .components(new Components()
                .addSecuritySchemes(
                    "basicAuth",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("basic")
                )
            )

            // Indicar que los endpoints protegidos
            // utilizan la autenticacion configurada.
            .addSecurityItem(
                new SecurityRequirement()
                    .addList("basicAuth")
            );
    }
}