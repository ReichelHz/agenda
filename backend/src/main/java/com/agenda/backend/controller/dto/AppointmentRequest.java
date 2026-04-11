package com.agenda.backend.controller.dto;

import com.agenda.backend.model.LocationType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class AppointmentRequest {

    @NotNull(message = "El ID del profesional es obligatorio")
    private Long professionalId;

    @NotNull(message = "El ID del servicio es obligatorio")
    private Long serviceId;

    @NotBlank(message = "El nombre del paciente es obligatorio")
    private String patientName;

    @NotBlank(message = "El email del paciente es obligatorio")
    @Email(message = "Email con formato inválido")
    private String patientEmail;

    private String patientPhone;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate date;

    @NotNull(message = "La hora es obligatoria")
    private LocalTime time;

    @NotNull(message = "El tipo de ubicación es obligatorio")
    private LocationType locationType;

    private String address; // Obligatorio solo si locationType es HOME
}
