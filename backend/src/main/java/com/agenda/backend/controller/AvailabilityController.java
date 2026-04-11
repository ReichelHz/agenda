package com.agenda.backend.controller;

import com.agenda.backend.model.Availability;
import com.agenda.backend.repository.AvailabilityRepository;
import com.agenda.backend.repository.ProfessionalRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/availabilities")
public class AvailabilityController {

    private final AvailabilityRepository availabilityRepository;
    private final ProfessionalRepository professionalRepository;

    public AvailabilityController(AvailabilityRepository availabilityRepository, 
                                  ProfessionalRepository professionalRepository) {
        this.availabilityRepository = availabilityRepository;
        this.professionalRepository = professionalRepository;
    }

    @PostMapping
    public ResponseEntity<Availability> create(@RequestBody Availability availability) {
        Availability saved = availabilityRepository.save(availability);
        
        professionalRepository.findById(saved.getProfessional().getId())
                .ifPresent(saved::setProfessional);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/professional/{id}")
    public List<Availability> getByProfessional(@PathVariable Long id) {
        return availabilityRepository.findByProfessionalId(id);
    }
}
