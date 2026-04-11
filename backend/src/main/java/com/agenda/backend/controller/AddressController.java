package com.agenda.backend.controller;

import com.agenda.backend.controller.dto.AddressRequest;
import com.agenda.backend.exception.ResourceNotFoundException;
import com.agenda.backend.model.Patient;
import com.agenda.backend.model.PatientAddress;
import com.agenda.backend.model.User;
import com.agenda.backend.repository.PatientAddressRepository;
import com.agenda.backend.repository.PatientRepository;
import com.agenda.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final PatientAddressRepository addressRepository;
    private final PatientRepository patientRepository;
    private final UserService userService;

    public AddressController(PatientAddressRepository addressRepository, 
                             PatientRepository patientRepository,
                             UserService userService) {
        this.addressRepository = addressRepository;
        this.patientRepository = patientRepository;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<PatientAddress>> listMyAddresses(Authentication authentication) {
        Patient patient = getAuthenticatedPatient(authentication);
        return ResponseEntity.ok(addressRepository.findAllByPatientId(patient.getId()));
    }

    @PostMapping
    public ResponseEntity<PatientAddress> addAddress(
            @Valid @RequestBody AddressRequest request, 
            Authentication authentication
    ) {
        Patient patient = getAuthenticatedPatient(authentication);
        
        PatientAddress address = new PatientAddress();
        address.setPatient(patient);
        address.setLabel(request.getLabel());
        address.setAddress(request.getAddress());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(addressRepository.save(address));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id, Authentication authentication) {
        Patient patient = getAuthenticatedPatient(authentication);
        PatientAddress address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dirección no encontrada"));

        if (!address.getPatient().getId().equals(patient.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        addressRepository.delete(address);
        return ResponseEntity.noContent().build();
    }

    private Patient getAuthenticatedPatient(Authentication authentication) {
        User user = userService.getByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        
        return patientRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de paciente no encontrado"));
    }
}
