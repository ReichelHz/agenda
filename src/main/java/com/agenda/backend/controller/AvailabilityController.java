package com.agenda.backend.controller;

import com.agenda.backend.model.Availability;
import com.agenda.backend.repository.AvailabilityRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/availabilities")
public class AvailabilityController {

    private final AvailabilityRepository availabilityRepository;

    public AvailabilityController(AvailabilityRepository availabilityRepository) {
        this.availabilityRepository = availabilityRepository;
    }

    @PostMapping
    public ResponseEntity<Availability> create(@RequestBody Availability availability) {
        return ResponseEntity.status(HttpStatus.CREATED).body(availabilityRepository.save(availability));
    }

    @GetMapping("/professional/{id}")
    public List<Availability> getByProfessional(@PathVariable Long id) {
        return availabilityRepository.findByProfessionalId(id);
    }
}
