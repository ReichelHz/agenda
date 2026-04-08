package com.agenda.backend.controller;

import com.agenda.backend.model.Service;
import com.agenda.backend.repository.ServiceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceRepository serviceRepository;

    public ServiceController(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    @GetMapping
    public List<Service> getAll() {
        return serviceRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Service> create(@RequestBody Service service) {
        return ResponseEntity.status(HttpStatus.CREATED).body(serviceRepository.save(service));
    }
}
