package com.agenda.backend.controller.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddressRequest {
    @NotBlank(message = "La etiqueta es obligatoria (ej: Casa)")
    private String label;

    @NotBlank(message = "La dirección es obligatoria")
    private String address;
}
