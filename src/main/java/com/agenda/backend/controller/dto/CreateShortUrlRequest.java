package com.agenda.backend.controller.dto;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.URL;

public class CreateShortUrlRequest {

    @NotBlank(message = "La URL es obligatoria")
    @URL(message = "La URL debe tener un formato valido")
    private String originalUrl;

    private String customAlias;

    public String getOriginalUrl() {
        return originalUrl;
    }

    public void setOriginalUrl(String originalUrl) {
        this.originalUrl = originalUrl;
    }

    public String getCustomAlias() {
        return customAlias;
    }

    public void setCustomAlias(String customAlias) {
        this.customAlias = customAlias;
    }
}
