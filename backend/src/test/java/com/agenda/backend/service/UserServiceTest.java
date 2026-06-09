package com.agenda.backend.service;

import com.agenda.backend.controller.dto.ChangePasswordRequest;
import com.agenda.backend.controller.dto.LoginRequest;
import com.agenda.backend.controller.dto.RegisterUserRequest;
import com.agenda.backend.exception.AuthenticationFailedException;
import com.agenda.backend.exception.EmailAlreadyInUseException;
import com.agenda.backend.exception.ResourceNotFoundException;
import com.agenda.backend.model.Patient;
import com.agenda.backend.model.Professional;
import com.agenda.backend.model.Role;
import com.agenda.backend.model.User;
import com.agenda.backend.model.Appointment;
import com.agenda.backend.repository.AppointmentRepository;
import com.agenda.backend.repository.PatientRepository;
import com.agenda.backend.repository.ProfessionalRepository;
import com.agenda.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private ProfessionalRepository professionalRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User mockUser;
    private RegisterUserRequest registerRequest;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setName("Test User");
        mockUser.setEmail("test@test.com");
        mockUser.setPassword("encoded_password");
        mockUser.setRole(Role.PATIENT);

        registerRequest = new RegisterUserRequest();
        registerRequest.setName("Test User");
        registerRequest.setEmail("test@test.com");
        registerRequest.setPassword("raw_password");
        registerRequest.setRole(Role.PATIENT);
    }

    @Test
    void registerUser_Success() {
        when(userRepository.existsByEmail("test@test.com")).thenReturn(false);
        when(passwordEncoder.encode("raw_password")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        when(patientRepository.save(any(Patient.class))).thenReturn(new Patient());
        when(appointmentRepository.findAllByPatientEmailIgnoreCaseAndPatientIsNull("test@test.com"))
                .thenReturn(Collections.emptyList());

        User result = userService.registerUser(registerRequest);

        assertNotNull(result);
        assertEquals("test@test.com", result.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
        verify(patientRepository, times(1)).save(any(Patient.class));
    }

    @Test
    void registerUser_EmailAlreadyExists() {
        when(userRepository.existsByEmail("test@test.com")).thenReturn(true);

        assertThrows(EmailAlreadyInUseException.class, () -> userService.registerUser(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@test.com");
        loginRequest.setPassword("raw_password");

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("raw_password", "encoded_password")).thenReturn(true);

        User result = userService.login(loginRequest);

        assertNotNull(result);
        assertEquals("test@test.com", result.getEmail());
    }

    @Test
    void login_InvalidPassword() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@test.com");
        loginRequest.setPassword("wrong_password");

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("wrong_password", "encoded_password")).thenReturn(false);

        assertThrows(AuthenticationFailedException.class, () -> userService.login(loginRequest));
    }

    @Test
    void getById_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        User result = userService.getById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void getById_NotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getById(1L));
    }

    @Test
    void loadUserByUsername_Success() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(mockUser));

        UserDetails userDetails = userService.loadUserByUsername("test@test.com");

        assertNotNull(userDetails);
        assertEquals("test@test.com", userDetails.getUsername());
    }

    @Test
    void loadUserByUsername_NotFound() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> userService.loadUserByUsername("test@test.com"));
    }

    @Test
    void registerUser_Professional_Success() {
        registerRequest.setRole(Role.PROFESSIONAL);
        mockUser.setRole(Role.PROFESSIONAL);

        when(userRepository.existsByEmail("test@test.com")).thenReturn(false);
        when(passwordEncoder.encode("raw_password")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        when(professionalRepository.save(any(Professional.class))).thenReturn(new Professional());

        User result = userService.registerUser(registerRequest);

        assertNotNull(result);
        assertEquals(Role.PROFESSIONAL, result.getRole());
        verify(userRepository, times(1)).save(any(User.class));
        verify(professionalRepository, times(1)).save(any(Professional.class));
        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    void registerUser_SyncsPastAppointments() {
        when(userRepository.existsByEmail("test@test.com")).thenReturn(false);
        when(passwordEncoder.encode("raw_password")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        
        Patient savedPatient = new Patient();
        when(patientRepository.save(any(Patient.class))).thenReturn(savedPatient);

        Appointment pastAppointment = new Appointment();
        pastAppointment.setPatientEmail("test@test.com");
        when(appointmentRepository.findAllByPatientEmailIgnoreCaseAndPatientIsNull("test@test.com"))
                .thenReturn(Collections.singletonList(pastAppointment));

        User result = userService.registerUser(registerRequest);

        assertNotNull(result);
        assertEquals(savedPatient, pastAppointment.getPatient());
        verify(appointmentRepository, times(1)).save(pastAppointment);
    }

    @Test
    void changePassword_Success() {
        ChangePasswordRequest passwordRequest = new ChangePasswordRequest();
        passwordRequest.setCurrentPassword("old_password");
        passwordRequest.setNewPassword("new_password");

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("old_password", "encoded_password")).thenReturn(true);
        when(passwordEncoder.encode("new_password")).thenReturn("new_encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        userService.changePassword("test@test.com", passwordRequest);

        verify(userRepository, times(1)).save(mockUser);
        assertEquals("new_encoded_password", mockUser.getPassword());
    }

    @Test
    void changePassword_WrongCurrentPassword() {
        ChangePasswordRequest passwordRequest = new ChangePasswordRequest();
        passwordRequest.setCurrentPassword("wrong_old_password");
        passwordRequest.setNewPassword("new_password");

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("wrong_old_password", "encoded_password")).thenReturn(false);

        assertThrows(AuthenticationFailedException.class, () -> userService.changePassword("test@test.com", passwordRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void changePassword_UserNotFound() {
        ChangePasswordRequest passwordRequest = new ChangePasswordRequest();
        passwordRequest.setCurrentPassword("old_password");
        passwordRequest.setNewPassword("new_password");

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.empty());

        assertThrows(AuthenticationFailedException.class, () -> userService.changePassword("test@test.com", passwordRequest));
    }

    @Test
    void getByEmail_Success() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(mockUser));

        Optional<User> result = userService.getByEmail("test@test.com");

        assertTrue(result.isPresent());
        assertEquals("test@test.com", result.get().getEmail());
    }

    @Test
    void getByEmail_EmptyOrNull() {
        Optional<User> resultNull = userService.getByEmail(null);
        Optional<User> resultEmpty = userService.getByEmail("  ");

        assertFalse(resultNull.isPresent());
        assertFalse(resultEmpty.isPresent());
    }
}

