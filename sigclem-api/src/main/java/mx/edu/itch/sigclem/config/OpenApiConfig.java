package mx.edu.itch.sigclem.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Especificación OpenAPI 3 de la API (decisión DA-10). */
@Configuration
public class OpenApiConfig {

    private static final String ESQUEMA = "bearerAuth";

    @Bean
    public OpenAPI sigclemOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("SIGCLEM API")
                        .version("v1")
                        .description("API REST de la Coordinación de Lenguas Extranjeras y Maternas del ITCH"))
                .addSecurityItem(new SecurityRequirement().addList(ESQUEMA))
                .components(new Components().addSecuritySchemes(ESQUEMA,
                        new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")));
    }
}
