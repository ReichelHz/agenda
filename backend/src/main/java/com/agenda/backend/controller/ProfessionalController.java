package com.agenda.backend.controller;

import com.agenda.backend.controller.dto.ProfessionalSettingsRequest;
import com.agenda.backend.exception.ResourceNotFoundException;
import com.agenda.backend.model.Professional;
import com.agenda.backend.model.User;
import com.agenda.backend.repository.ProfessionalRepository;
import com.agenda.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/professional")
public class ProfessionalController {

    private final ProfessionalRepository professionalRepository;
    private final UserService userService;

    public ProfessionalController(ProfessionalRepository professionalRepository, UserService userService) {
        this.professionalRepository = professionalRepository;
        this.userService = userService;
    }

    @GetMapping("/settings")
    public ResponseEntity<Professional> getSettings(Authentication authentication) {
        Professional professional = getAuthenticatedProfessional(authentication);
        return ResponseEntity.ok(professional);
    }

    @PatchMapping("/settings")
    public ResponseEntity<Professional> updateSettings(
            @RequestBody ProfessionalSettingsRequest request,
            Authentication authentication
    ) {
        Professional professional = getAuthenticatedProfessional(authentication);

        if (request.getHomeVisitFee() != null) {
            professional.setHomeVisitFee(request.getHomeVisitFee());
        }
        if (request.getAllowsHomeVisit() != null) {
            professional.setAllowsHomeVisit(request.getAllowsHomeVisit());
        }

        return ResponseEntity.ok(professionalRepository.save(professional));
    }

    private Professional getAuthenticatedProfessional(Authentication authentication) {
        User user = userService.getByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        
        return professionalRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de profesional no encontrado"));
    }
}
