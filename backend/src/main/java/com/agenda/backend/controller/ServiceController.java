package com.agenda.backend.controller;

import com.agenda.backend.controller.dto.ServiceResponse;
import com.agenda.backend.model.Service;
import com.agenda.backend.model.User;
import com.agenda.backend.repository.ServiceRepository;
import com.agenda.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;

    public ServiceController(ServiceRepository serviceRepository, UserRepository userRepository) {
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public Page<ServiceResponse> getAll(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        if (search != null && !search.isBlank()) {
            return serviceRepository
                    .findByProfessionalIsNotNullAndNameContainingIgnoreCase(search.trim(), pageable)
                    .map(ServiceResponse::from);
        }
        return serviceRepository.findByProfessionalIsNotNull(pageable).map(ServiceResponse::from);
    }

    @GetMapping("/professional/{professionalId}")
    public List<ServiceResponse> getByProfessional(@PathVariable Long professionalId) {
        return serviceRepository.findByProfessionalId(professionalId)
                .stream()
                .map(ServiceResponse::from)
                .toList();
    }

    @PostMapping
    public ResponseEntity<ServiceResponse> create(@RequestBody Service service) {
        if (service.getProfessional() != null && service.getProfessional().getId() != null) {
            User professional = userRepository.findById(service.getProfessional().getId()).orElse(null);
            if (professional != null) {
                service.setProfessional(professional);
            }
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ServiceResponse.from(serviceRepository.save(service)));
    }
}
