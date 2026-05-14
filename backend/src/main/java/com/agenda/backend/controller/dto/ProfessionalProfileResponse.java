package com.agenda.backend.controller.dto;

import com.agenda.backend.model.Professional;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class ProfessionalProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String description;
    private String phone;
    private LocalDate birthDate;
    private BigDecimal homeVisitFee;
    private boolean allowsHomeVisit;

    public static ProfessionalProfileResponse from(Professional p) {
        ProfessionalProfileResponse r = new ProfessionalProfileResponse();
        r.setId(p.getId());
        r.setName(p.getUser().getName());
        r.setEmail(p.getUser().getEmail());
        r.setDescription(p.getDescription());
        r.setPhone(p.getPhone());
        r.setBirthDate(p.getBirthDate());
        r.setHomeVisitFee(p.getHomeVisitFee());
        r.setAllowsHomeVisit(p.isAllowsHomeVisit());
        return r;
    }
}
