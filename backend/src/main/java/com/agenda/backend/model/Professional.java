package com.agenda.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Professional {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    private String description;
    private String phone;
    private LocalDate birthDate;

    private java.math.BigDecimal homeVisitFee;
    
    @jakarta.persistence.Column(nullable = false, columnDefinition = "boolean default true")
    private boolean allowsHomeVisit = true;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "professional_services",
        joinColumns = @JoinColumn(name = "professional_id"),
        inverseJoinColumns = @JoinColumn(name = "service_id")
    )
    private Set<Service> services = new HashSet<>();
}
