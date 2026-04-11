package com.agenda.backend.controller.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class ProfessionalSettingsRequest {
    private BigDecimal homeVisitFee;
    private Boolean allowsHomeVisit;
}
