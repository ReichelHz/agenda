package com.agenda.backend.controller.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class ProfessionalSettingsRequest {
    private String name;
    private String description;
    private String phone;
    private LocalDate birthDate;
    private BigDecimal homeVisitFee;
    private Boolean allowsHomeVisit;
}
