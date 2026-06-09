package com.agenda.backend.service;

import com.agenda.backend.controller.dto.AppointmentRequest;
import com.agenda.backend.exception.ResourceNotFoundException;
import com.agenda.backend.model.*;
import com.agenda.backend.repository.AppointmentRepository;
import com.agenda.backend.repository.PatientRepository;
import com.agenda.backend.repository.ProfessionalRepository;
import com.agenda.backend.repository.ServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private ProfessionalRepository professionalRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private MailService mailService;

    @InjectMocks
    private AppointmentService appointmentService;

    private Professional mockProfessional;
    private com.agenda.backend.model.Service mockService;
    private User mockUser;
    private AppointmentRequest request;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setName("Test Professional");

        mockProfessional = new Professional();
        mockProfessional.setId(1L);
        mockProfessional.setUser(mockUser);
        mockProfessional.setAllowsHomeVisit(true);
        mockProfessional.setHomeVisitFee(new BigDecimal("10.0"));

        mockService = new com.agenda.backend.model.Service();
        mockService.setId(1L);
        mockService.setName("Test Service");
        mockService.setPrice(new BigDecimal("50.0"));
        mockService.setModality(ServiceModality.AMBAS);

        request = new AppointmentRequest();
        request.setProfessionalId(1L);
        request.setServiceId(1L);
        request.setDate(LocalDate.now().plusDays(1));
        request.setTime(LocalTime.of(10, 0));
        request.setLocationType(LocationType.VIRTUAL);
        request.setPatientName("Test Patient");
        request.setPatientEmail("patient@test.com");
    }

    @Test
    void createAppointment_Success_Virtual() {
        when(professionalRepository.findById(1L)).thenReturn(Optional.of(mockProfessional));
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(mockService));
        when(appointmentRepository.findByProfessionalIdAndDateAndTimeAndStatusNot(
                anyLong(), any(LocalDate.class), any(LocalTime.class), any(AppointmentStatus.class)))
                .thenReturn(Optional.empty());
        when(appointmentRepository.existsByReservationCode(anyString())).thenReturn(false);
        
        Appointment mockAppointment = new Appointment();
        mockAppointment.setReservationCode("SL123456");
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(mockAppointment);

        Appointment result = appointmentService.createAppointment(request, Optional.empty());

        assertNotNull(result);
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
        verify(mailService, times(1)).sendAppointmentConfirmationEmail(any(EmailAppointmentSnapshot.class));
    }

    @Test
    void createAppointment_ProfessionalNotFound() {
        when(professionalRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> appointmentService.createAppointment(request, Optional.empty()));
    }

    @Test
    void createAppointment_ServiceNotFound() {
        when(professionalRepository.findById(1L)).thenReturn(Optional.of(mockProfessional));
        when(serviceRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> appointmentService.createAppointment(request, Optional.empty()));
    }

    @Test
    void createAppointment_InvalidModality() {
        mockService.setModality(ServiceModality.PRESENCIAL);
        when(professionalRepository.findById(1L)).thenReturn(Optional.of(mockProfessional));
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(mockService));

        assertThrows(IllegalStateException.class, () -> appointmentService.createAppointment(request, Optional.empty()));
    }

    @Test
    void createAppointment_SlotOccupied() {
        when(professionalRepository.findById(1L)).thenReturn(Optional.of(mockProfessional));
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(mockService));
        when(appointmentRepository.findByProfessionalIdAndDateAndTimeAndStatusNot(
                anyLong(), any(LocalDate.class), any(LocalTime.class), any(AppointmentStatus.class)))
                .thenReturn(Optional.of(new Appointment()));

        assertThrows(IllegalStateException.class, () -> appointmentService.createAppointment(request, Optional.empty()));
    }

    @Test
    void findByCodeAndEmail_Success() {
        Appointment appointment = new Appointment();
        appointment.setReservationCode("SL123456");
        appointment.setPatientEmail("patient@test.com");

        when(appointmentRepository.findByReservationCode("SL123456")).thenReturn(Optional.of(appointment));

        Appointment result = appointmentService.findByCodeAndEmail("SL123456", "patient@test.com");

        assertNotNull(result);
        assertEquals("SL123456", result.getReservationCode());
    }

    @Test
    void findByCodeAndEmail_NotFound() {
        when(appointmentRepository.findByReservationCode("SL123456")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> appointmentService.findByCodeAndEmail("SL123456", "patient@test.com"));
    }

    @Test
    void findByCodeAndEmail_EmailMismatch() {
        Appointment appointment = new Appointment();
        appointment.setReservationCode("SL123456");
        appointment.setPatientEmail("patient@test.com");

        when(appointmentRepository.findByReservationCode("SL123456")).thenReturn(Optional.of(appointment));

        assertThrows(IllegalArgumentException.class, () -> appointmentService.findByCodeAndEmail("SL123456", "wrong@test.com"));
    }

    @Test
    void createAppointment_Success_Home() {
        request.setLocationType(LocationType.HOME);
        request.setAddress("Calle Falsa 123");

        when(professionalRepository.findById(1L)).thenReturn(Optional.of(mockProfessional));
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(mockService));
        when(appointmentRepository.findByProfessionalIdAndDateAndTimeAndStatusNot(
                anyLong(), any(LocalDate.class), any(LocalTime.class), any(AppointmentStatus.class)))
                .thenReturn(Optional.empty());
        when(appointmentRepository.existsByReservationCode(anyString())).thenReturn(false);

        Appointment mockAppointment = new Appointment();
        mockAppointment.setReservationCode("SL123456");
        mockAppointment.setTotalPrice(new BigDecimal("60.0")); // 50.0 + 10.0
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(mockAppointment);

        Appointment result = appointmentService.createAppointment(request, Optional.empty());

        assertNotNull(result);
        assertEquals(new BigDecimal("60.0"), result.getTotalPrice());
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    void createAppointment_Home_NotAllowed() {
        request.setLocationType(LocationType.HOME);
        request.setAddress("Calle Falsa 123");
        mockProfessional.setAllowsHomeVisit(false);

        when(professionalRepository.findById(1L)).thenReturn(Optional.of(mockProfessional));
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(mockService));

        assertThrows(IllegalStateException.class, () -> appointmentService.createAppointment(request, Optional.empty()));
    }

    @Test
    void createAppointment_Home_NoFee() {
        request.setLocationType(LocationType.HOME);
        request.setAddress("Calle Falsa 123");
        mockProfessional.setAllowsHomeVisit(true);
        mockProfessional.setHomeVisitFee(null);

        when(professionalRepository.findById(1L)).thenReturn(Optional.of(mockProfessional));
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(mockService));

        assertThrows(IllegalStateException.class, () -> appointmentService.createAppointment(request, Optional.empty()));
    }

    @Test
    void createAppointment_Home_NoAddress() {
        request.setLocationType(LocationType.HOME);
        request.setAddress(""); // blank

        when(professionalRepository.findById(1L)).thenReturn(Optional.of(mockProfessional));
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(mockService));

        assertThrows(IllegalArgumentException.class, () -> appointmentService.createAppointment(request, Optional.empty()));
    }

    @Test
    void updateStatusByCode_Confirmed_Success() {
        Appointment appointment = new Appointment();
        appointment.setReservationCode("SL123456");
        appointment.setPatientEmail("patient@test.com");
        appointment.setStatus(AppointmentStatus.PENDING);

        when(appointmentRepository.findByReservationCode("SL123456")).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        Appointment result = appointmentService.updateStatusByCode("SL123456", "patient@test.com", AppointmentStatus.CONFIRMED);

        assertNotNull(result);
        assertEquals(AppointmentStatus.CONFIRMED, result.getStatus());
        verify(mailService, never()).sendAppointmentCancellationEmail(any(EmailAppointmentSnapshot.class));
    }

    @Test
    void updateStatusByCode_Cancelled_Success() {
        Appointment appointment = new Appointment();
        appointment.setReservationCode("SL123456");
        appointment.setPatientEmail("patient@test.com");
        appointment.setStatus(AppointmentStatus.PENDING);

        when(appointmentRepository.findByReservationCode("SL123456")).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        Appointment result = appointmentService.updateStatusByCode("SL123456", "patient@test.com", AppointmentStatus.CANCELLED);

        assertNotNull(result);
        assertEquals(AppointmentStatus.CANCELLED, result.getStatus());
        verify(mailService, times(1)).sendAppointmentCancellationEmail(any(EmailAppointmentSnapshot.class));
    }

    @Test
    void updateStatusByCode_InvalidStatus() {
        assertThrows(IllegalArgumentException.class, () -> appointmentService.updateStatusByCode("SL123456", "patient@test.com", AppointmentStatus.PENDING));
    }

    @Test
    void updateStatusById_Success() {
        Appointment appointment = new Appointment();
        appointment.setId(10L);
        appointment.setProfessional(mockProfessional);
        appointment.setStatus(AppointmentStatus.PENDING);

        when(appointmentRepository.findById(10L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        Appointment result = appointmentService.updateStatusById(10L, 1L, AppointmentStatus.CONFIRMED);

        assertNotNull(result);
        assertEquals(AppointmentStatus.CONFIRMED, result.getStatus());
    }

    @Test
    void updateStatusById_WrongProfessional() {
        Appointment appointment = new Appointment();
        appointment.setId(10L);
        appointment.setProfessional(mockProfessional); // ID is 1L

        when(appointmentRepository.findById(10L)).thenReturn(Optional.of(appointment));

        assertThrows(IllegalArgumentException.class, () -> appointmentService.updateStatusById(10L, 2L, AppointmentStatus.CONFIRMED));
    }

    @Test
    @SuppressWarnings("unchecked")
    void sendReminderEmails_Success() {
        Appointment appointment = new Appointment();
        appointment.setId(10L);
        appointment.setPatientEmail("patient@test.com");

        org.springframework.data.domain.Page<Appointment> mockPage = mock(org.springframework.data.domain.Page.class);
        when(mockPage.getContent()).thenReturn(Collections.singletonList(appointment));
        when(mockPage.hasNext()).thenReturn(false);

        when(appointmentRepository.findAppointmentsForReminder(
                any(LocalDate.class), any(LocalTime.class), any(LocalDate.class), any(AppointmentStatus.class), any(org.springframework.data.domain.Pageable.class)
        )).thenReturn(mockPage);

        appointmentService.sendReminderEmails();

        assertTrue(appointment.getReminderSent());
        verify(mailService, times(1)).sendAppointmentReminderEmail(any(EmailAppointmentSnapshot.class));
        verify(appointmentRepository, times(1)).save(appointment);
    }
}

