package com.agenda.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI agendaOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Agenda API")
                        .description("API para autenticacion, acortador de URLs y gestion de agenda")
                        .version("v1")
                        .license(new License().name("MIT")));
    }
}
