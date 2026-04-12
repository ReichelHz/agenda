package com.agenda.backend.controller.dto;

import com.agenda.backend.model.Service;

import java.math.BigDecimal;

public record ServiceResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        Integer durationMinutes,
        ProfessionalInfo professional
) {
    public record ProfessionalInfo(Long id, String name) {}

    public static ServiceResponse from(Service service) {
        ProfessionalInfo prof = service.getProfessional() != null
                ? new ProfessionalInfo(
                        service.getProfessional().getId(),
                        service.getProfessional().getName())
                : null;
        return new ServiceResponse(
                service.getId(),
                service.getName(),
                service.getDescription(),
                service.getPrice(),
                service.getDurationMinutes(),
                prof);
    }
}
