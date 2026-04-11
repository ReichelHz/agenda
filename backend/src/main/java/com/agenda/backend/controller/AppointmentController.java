package com.agenda.backend.controller;

import com.agenda.backend.controller.dto.AppointmentRequest;
import com.agenda.backend.controller.dto.AppointmentResponse;
import com.agenda.backend.model.Appointment;
import com.agenda.backend.model.AppointmentStatus;
import com.agenda.backend.model.User;
import com.agenda.backend.service.AppointmentService;
import com.agenda.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final UserService userService;

    public AppointmentController(AppointmentService appointmentService, UserService userService) {
        this.appointmentService = appointmentService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<AppointmentResponse> book(
            @Valid @RequestBody AppointmentRequest request,
            Authentication authentication
    ) {
        Optional<User> user = Optional.empty();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            user = userService.getByEmail(authentication.getName());
        }

        Appointment created = appointmentService.createAppointment(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(AppointmentResponse.from(created));
    }

    @GetMapping("/me")
    public ResponseEntity<java.util.List<AppointmentResponse>> getMyAppointments(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        User user = userService.getByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                
        java.util.List<AppointmentResponse> history = appointmentService.listByPatientId(user.getId())
                .stream()
                .map(AppointmentResponse::from)
                .toList();
                
        return ResponseEntity.ok(history);
    }

    @GetMapping("/by-code/{code}")
    public ResponseEntity<AppointmentResponse> getByCode(
            @PathVariable String code,
            @RequestParam String email
    ) {
        Appointment appointment = appointmentService.findByCodeAndEmail(code, email);
        return ResponseEntity.ok(AppointmentResponse.from(appointment));
    }

    @PatchMapping("/{code}/status")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable String code,
            @RequestParam String email,
            @RequestParam AppointmentStatus status
    ) {
        Appointment updated = appointmentService.updateStatusByCode(code, email, status);
        return ResponseEntity.ok(AppointmentResponse.from(updated));
    }

    @GetMapping("/professional")
    public ResponseEntity<java.util.List<AppointmentResponse>> getProfessionalAppointments(Authentication authentication) {
        User user = userService.getByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                
        java.util.List<AppointmentResponse> list = appointmentService.listByProfessionalId(user.getId())
                .stream()
                .map(AppointmentResponse::from)
                .toList();
                
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/{id}/status-admin")
    public ResponseEntity<AppointmentResponse> updateStatusAdmin(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status,
            Authentication authentication
    ) {
        User user = userService.getByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                
        Appointment updated = appointmentService.updateStatusById(id, user.getId(), status);
        return ResponseEntity.ok(AppointmentResponse.from(updated));
    }
}
