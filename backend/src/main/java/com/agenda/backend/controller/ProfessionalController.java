package com.agenda.backend.controller;

import com.agenda.backend.controller.dto.ProfessionalProfileResponse;
import com.agenda.backend.controller.dto.ProfessionalSettingsRequest;
import com.agenda.backend.exception.ResourceNotFoundException;
import com.agenda.backend.model.Professional;
import com.agenda.backend.model.User;
import com.agenda.backend.repository.ProfessionalRepository;
import com.agenda.backend.repository.UserRepository;
import com.agenda.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/professional")
public class ProfessionalController {

    private final ProfessionalRepository professionalRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public ProfessionalController(ProfessionalRepository professionalRepository,
                                  UserRepository userRepository,
                                  UserService userService) {
        this.professionalRepository = professionalRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @GetMapping("/settings")
    public ResponseEntity<ProfessionalProfileResponse> getSettings(Authentication authentication) {
        Professional professional = getAuthenticatedProfessional(authentication);
        return ResponseEntity.ok(ProfessionalProfileResponse.from(professional));
    }

    @PatchMapping("/settings")
    public ResponseEntity<ProfessionalProfileResponse> updateSettings(
            @RequestBody ProfessionalSettingsRequest request,
            Authentication authentication
    ) {
        Professional professional = getAuthenticatedProfessional(authentication);
        User user = professional.getUser();

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
            userRepository.save(user);
        }
        if (request.getDescription() != null) {
            professional.setDescription(request.getDescription());
        }
        if (request.getPhone() != null) {
            professional.setPhone(request.getPhone());
        }
        if (request.getBirthDate() != null) {
            professional.setBirthDate(request.getBirthDate());
        }
        if (request.getHomeVisitFee() != null) {
            professional.setHomeVisitFee(request.getHomeVisitFee());
        }
        if (request.getAllowsHomeVisit() != null) {
            professional.setAllowsHomeVisit(request.getAllowsHomeVisit());
        }

        return ResponseEntity.ok(ProfessionalProfileResponse.from(professionalRepository.save(professional)));
    }

    private Professional getAuthenticatedProfessional(Authentication authentication) {
        User user = userService.getByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        return professionalRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de profesional no encontrado"));
    }
}
