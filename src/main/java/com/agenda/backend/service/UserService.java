package com.agenda.backend.service;

import com.agenda.backend.controller.dto.LoginRequest;
import com.agenda.backend.controller.dto.RegisterUserRequest;
import com.agenda.backend.exception.AuthenticationFailedException;
import com.agenda.backend.exception.EmailAlreadyInUseException;
import com.agenda.backend.exception.ResourceNotFoundException;
import com.agenda.backend.model.*;
import com.agenda.backend.repository.PatientRepository;
import com.agenda.backend.repository.ProfessionalRepository;
import com.agenda.backend.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final ProfessionalRepository professionalRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, 
                       PatientRepository patientRepository,
                       ProfessionalRepository professionalRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.professionalRepository = professionalRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerUser(RegisterUserRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyInUseException();
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        Role role = request.getRole() == null ? Role.PATIENT : request.getRole();
        user.setRole(role);

        User savedUser = userRepository.save(user);

        if (role == Role.PATIENT) {
            Patient patient = new Patient();
            patient.setUser(savedUser);
            patient.setPhone(request.getPhone());
            patient.setBirthDate(request.getBirthDate());
            patientRepository.save(patient);
        } else if (role == Role.PROFESSIONAL) {
            Professional professional = new Professional();
            professional.setUser(savedUser);
            professional.setPhone(request.getPhone());
            professional.setBirthDate(request.getBirthDate());
            professionalRepository.save(professional);
        }

        return savedUser;
    }

    public User login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(AuthenticationFailedException::new);

        boolean validPassword = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!validPassword) {
            throw new AuthenticationFailedException();
        }

        return user;
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public Optional<User> getByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return Optional.empty();
        }
        return userRepository.findByEmail(email.trim().toLowerCase());
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username.trim().toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
