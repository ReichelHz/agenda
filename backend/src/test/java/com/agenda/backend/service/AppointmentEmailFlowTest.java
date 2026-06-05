package com.agenda.backend.service;

import com.agenda.backend.controller.dto.AppointmentRequest;
import com.agenda.backend.model.*;
import com.agenda.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Test unitario del flujo email en AppointmentService.
 *
 * Verifica que al crear o cancelar una cita se invoca MailService
 * con el snapshot correcto (email del paciente, código de reserva, etc.)
 * sin necesidad de una base de datos ni servidor SMTP real.
 */
@ExtendWith(MockitoExtension.class)
class AppointmentEmailFlowTest {

    // ── Repositorios mockeados ──────────────────────────────────
    @Mock private AppointmentRepository appointmentRepository;
    @Mock private ProfessionalRepository professionalRepository;
    @Mock private ServiceRepository      serviceRepository;
    @Mock private PatientRepository      patientRepository;
    @Mock private MailService            mailService;

    private AppointmentService appointmentService;

    // ── Entidades de prueba ─────────────────────────────────────
    private Professional professional;
    private Service       service;

    @BeforeEach
    void setUp() {
        appointmentService = new AppointmentService(
                appointmentRepository,
                professionalRepository,
                serviceRepository,
                patientRepository,
                mailService
        );

        // Usuario del profesional
        User profUser = new User();
        profUser.setId(1L);
        profUser.setName("Dra. Stefani Leiva");
        profUser.setEmail("stefani@agenda.com");

        // Profesional (setId() explícito porque @MapsId solo opera en contexto JPA)
        professional = new Professional();
        professional.setId(1L);
        professional.setUser(profUser);
        professional.setAllowsHomeVisit(false);

        // Servicio presencial
        service = new Service();
        service.setId(10L);
        service.setName("Acupuntura 60 min");
        service.setPrice(BigDecimal.valueOf(5000));
        service.setModality(ServiceModality.PRESENCIAL);
    }

    // ─────────────────────────────────────────────────────────────
    // Helper: construye una AppointmentRequest mínima válida
    // ─────────────────────────────────────────────────────────────
    private AppointmentRequest buildRequest() {
        AppointmentRequest req = new AppointmentRequest();
        req.setProfessionalId(1L);
        req.setServiceId(10L);
        req.setPatientName("Ana García");
        req.setPatientEmail("ana@test.com");
        req.setDate(LocalDate.of(2025, 8, 20));
        req.setTime(LocalTime.of(14, 0));
        req.setLocationType(LocationType.OFFICE);
        return req;
    }

    // ─────────────────────────────────────────────────────────────
    // Creación de cita → email de confirmación
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("createAppointment: se invoca sendAppointmentConfirmationEmail exactamente una vez")
    void createAppointment_sendsConfirmationEmailOnce() {
        stubRepositoriesForCreate();

        appointmentService.createAppointment(buildRequest(), Optional.empty());

        verify(mailService, times(1)).sendAppointmentConfirmationEmail(any(EmailAppointmentSnapshot.class));
    }

    @Test
    @DisplayName("createAppointment: el snapshot tiene el email del paciente")
    void createAppointment_snapshotContainsPatientEmail() {
        stubRepositoriesForCreate();

        appointmentService.createAppointment(buildRequest(), Optional.empty());

        EmailAppointmentSnapshot snapshot = captureConfirmationSnapshot();
        assertThat(snapshot.patientEmail()).isEqualTo("ana@test.com");
    }

    @Test
    @DisplayName("createAppointment: el snapshot tiene el nombre del profesional")
    void createAppointment_snapshotContainsProfessionalName() {
        stubRepositoriesForCreate();

        appointmentService.createAppointment(buildRequest(), Optional.empty());

        EmailAppointmentSnapshot snapshot = captureConfirmationSnapshot();
        assertThat(snapshot.professionalName()).isEqualTo("Dra. Stefani Leiva");
    }

    @Test
    @DisplayName("createAppointment: el snapshot tiene la fecha de la cita")
    void createAppointment_snapshotContainsDate() {
        stubRepositoriesForCreate();

        appointmentService.createAppointment(buildRequest(), Optional.empty());

        EmailAppointmentSnapshot snapshot = captureConfirmationSnapshot();
        assertThat(snapshot.date()).isEqualTo(LocalDate.of(2025, 8, 20));
    }

    @Test
    @DisplayName("createAppointment: el snapshot tiene un código de reserva no vacío")
    void createAppointment_snapshotContainsReservationCode() {
        stubRepositoriesForCreate();

        appointmentService.createAppointment(buildRequest(), Optional.empty());

        EmailAppointmentSnapshot snapshot = captureConfirmationSnapshot();
        assertThat(snapshot.reservationCode())
                .isNotBlank()
                .startsWith("SL");
    }

    @Test
    @DisplayName("createAppointment: no se envía email de cancelación en la creación")
    void createAppointment_noCancellationEmailSent() {
        stubRepositoriesForCreate();

        appointmentService.createAppointment(buildRequest(), Optional.empty());

        verify(mailService, never()).sendAppointmentCancellationEmail(any());
    }

    // ─────────────────────────────────────────────────────────────
    // Cancelación de cita → email de cancelación
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("updateStatusByCode a CANCELLED: se invoca sendAppointmentCancellationEmail")
    void updateStatusByCode_cancelled_sendsCancellationEmail() {
        Appointment appointment = buildSavedAppointment("SL555555", AppointmentStatus.PENDING);
        when(appointmentRepository.findByReservationCode("SL555555")).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        appointmentService.updateStatusByCode("SL555555", "ana@test.com", AppointmentStatus.CANCELLED);

        verify(mailService, times(1)).sendAppointmentCancellationEmail(any(EmailAppointmentSnapshot.class));
    }

    @Test
    @DisplayName("updateStatusByCode a CONFIRMED: NO se envía email de cancelación")
    void updateStatusByCode_confirmed_noCancellationEmail() {
        Appointment appointment = buildSavedAppointment("SL666666", AppointmentStatus.PENDING);
        when(appointmentRepository.findByReservationCode("SL666666")).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        appointmentService.updateStatusByCode("SL666666", "ana@test.com", AppointmentStatus.CONFIRMED);

        verify(mailService, never()).sendAppointmentCancellationEmail(any());
    }

    @Test
    @DisplayName("Cancelar una cita ya cancelada: NO vuelve a enviar email de cancelación")
    void cancelAlreadyCancelled_noDuplicateEmail() {
        Appointment appointment = buildSavedAppointment("SL777777", AppointmentStatus.CANCELLED);
        when(appointmentRepository.findByReservationCode("SL777777")).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        appointmentService.updateStatusByCode("SL777777", "ana@test.com", AppointmentStatus.CANCELLED);

        verify(mailService, never()).sendAppointmentCancellationEmail(any());
    }

    // ─────────────────────────────────────────────────────────────
    // Stubs y helpers internos
    // ─────────────────────────────────────────────────────────────

    /**
     * Configura todos los mocks necesarios para createAppointment().
     */
    private void stubRepositoriesForCreate() {
        when(professionalRepository.findById(1L)).thenReturn(Optional.of(professional));
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(service));
        when(appointmentRepository.findByProfessionalIdAndDateAndTimeAndStatusNot(
                eq(1L), any(LocalDate.class), any(LocalTime.class), any(AppointmentStatus.class)
        )).thenReturn(Optional.empty());
        when(appointmentRepository.existsByReservationCode(anyString())).thenReturn(false);

        // El save devuelve el appointment que recibe, ya con el código generado
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(inv -> {
            Appointment a = inv.getArgument(0);
            // El servicio ya le puso el reservationCode antes de llamar a save()
            return a;
        });
    }

    /**
     * Construye un Appointment persistido de ejemplo con el estado dado.
     */
    private Appointment buildSavedAppointment(String code, AppointmentStatus status) {
        Appointment a = new Appointment();
        a.setId(42L);
        a.setReservationCode(code);
        a.setPatientName("Ana García");
        a.setPatientEmail("ana@test.com");
        a.setProfessional(professional);
        a.setService(service);
        a.setDate(LocalDate.of(2025, 8, 20));
        a.setTime(LocalTime.of(14, 0));
        a.setStatus(status);
        a.setLocationType(LocationType.OFFICE);
        a.setTotalPrice(BigDecimal.valueOf(5000));
        return a;
    }

    /** Captura el snapshot pasado a sendAppointmentConfirmationEmail. */
    private EmailAppointmentSnapshot captureConfirmationSnapshot() {
        ArgumentCaptor<EmailAppointmentSnapshot> captor =
                ArgumentCaptor.forClass(EmailAppointmentSnapshot.class);
        verify(mailService).sendAppointmentConfirmationEmail(captor.capture());
        return captor.getValue();
    }
}
