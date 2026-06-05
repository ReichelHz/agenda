package com.agenda.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.mockito.Mockito.*;

/**
 * Test unitario de MailService.
 * Usa Mockito para capturar el SimpleMailMessage enviado
 * y verificar destinatario, asunto y contenido del cuerpo.
 */
@ExtendWith(MockitoExtension.class)
class MailServiceTest {

    private static final String FROM         = "noreply@agenda.test";
    private static final String FRONTEND_URL = "http://localhost:3000";

    @Mock
    private JavaMailSender mailSender;

    private MailService mailService;

    @BeforeEach
    void setUp() {
        mailService = new MailService(mailSender, FROM, FRONTEND_URL);
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────

    private EmailAppointmentSnapshot buildSnapshot(String email, String code) {
        return new EmailAppointmentSnapshot(
                email,
                "Dra. Stefani Leiva",
                LocalDate.of(2025, 6, 10),
                LocalTime.of(14, 0),
                code
        );
    }

    private SimpleMailMessage captureMessage() {
        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, times(1)).send(captor.capture());
        return captor.getValue();
    }

    // ─────────────────────────────────────────────────────────────
    // Email de confirmación
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Confirmación: destinatario correcto")
    void confirmation_recipientMatchesPatientEmail() {
        mailService.sendAppointmentConfirmationEmail(buildSnapshot("paciente@test.com", "SL100001"));
        assertThat(captureMessage().getTo()).containsExactly("paciente@test.com");
    }

    @Test
    @DisplayName("Confirmación: asunto correcto")
    void confirmation_subjectIsConfirmacion() {
        mailService.sendAppointmentConfirmationEmail(buildSnapshot("p@test.com", "SL100002"));
        assertThat(captureMessage().getSubject()).isEqualTo("Confirmación de cita");
    }

    @Test
    @DisplayName("Confirmación: cuerpo contiene nombre del profesional")
    void confirmation_bodyContainsProfessionalName() {
        mailService.sendAppointmentConfirmationEmail(buildSnapshot("p@test.com", "SL100003"));
        assertThat(captureMessage().getText()).contains("Dra. Stefani Leiva");
    }

    @Test
    @DisplayName("Confirmación: cuerpo contiene código de reserva")
    void confirmation_bodyContainsReservationCode() {
        mailService.sendAppointmentConfirmationEmail(buildSnapshot("p@test.com", "SL100004"));
        assertThat(captureMessage().getText()).contains("SL100004");
    }

    @Test
    @DisplayName("Confirmación: cuerpo contiene link de gestión con el código")
    void confirmation_bodyContainsManagementUrl() {
        mailService.sendAppointmentConfirmationEmail(buildSnapshot("p@test.com", "SL100005"));
        String body = captureMessage().getText();
        assertThat(body).contains(FRONTEND_URL + "/citas/SL100005");
    }

    @Test
    @DisplayName("Confirmación: link de gestión incluye el email codificado del paciente")
    void confirmation_managementUrlContainsEncodedEmail() {
        mailService.sendAppointmentConfirmationEmail(buildSnapshot("paciente@test.com", "SL100006"));
        // '@' se codifica como '%40'
        assertThat(captureMessage().getText()).contains("paciente%40test.com");
    }

    @Test
    @DisplayName("Confirmación: remitente es el configurado")
    void confirmation_fromAddressIsConfigured() {
        mailService.sendAppointmentConfirmationEmail(buildSnapshot("p@test.com", "SL100007"));
        assertThat(captureMessage().getFrom()).isEqualTo(FROM);
    }

    // ─────────────────────────────────────────────────────────────
    // Email de cancelación
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Cancelación: destinatario correcto")
    void cancellation_recipientMatchesPatientEmail() {
        mailService.sendAppointmentCancellationEmail(buildSnapshot("paciente@test.com", "SL200001"));
        assertThat(captureMessage().getTo()).containsExactly("paciente@test.com");
    }

    @Test
    @DisplayName("Cancelación: asunto correcto")
    void cancellation_subjectIsCancelacion() {
        mailService.sendAppointmentCancellationEmail(buildSnapshot("p@test.com", "SL200002"));
        assertThat(captureMessage().getSubject()).isEqualTo("Cancelación de cita");
    }

    @Test
    @DisplayName("Cancelación: cuerpo contiene código de reserva")
    void cancellation_bodyContainsReservationCode() {
        mailService.sendAppointmentCancellationEmail(buildSnapshot("p@test.com", "SL200003"));
        assertThat(captureMessage().getText()).contains("SL200003");
    }

    // ─────────────────────────────────────────────────────────────
    // Email de recordatorio
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Recordatorio: asunto correcto")
    void reminder_subjectIsRecordatorio() {
        mailService.sendAppointmentReminderEmail(buildSnapshot("p@test.com", "SL300001"));
        assertThat(captureMessage().getSubject()).isEqualTo("Recordatorio de tu cita");
    }

    @Test
    @DisplayName("Recordatorio: contiene link de gestión")
    void reminder_bodyContainsManagementUrl() {
        mailService.sendAppointmentReminderEmail(buildSnapshot("p@test.com", "SL300002"));
        assertThat(captureMessage().getText()).contains(FRONTEND_URL + "/citas/SL300002");
    }

    // ─────────────────────────────────────────────────────────────
    // Casos borde: email / snapshot nulo o vacío
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Email nulo en snapshot → no se envía ningún email")
    void nullEmail_noEmailSent() {
        EmailAppointmentSnapshot snapshot = new EmailAppointmentSnapshot(
                null, "Prof", LocalDate.now(), LocalTime.now(), "SL999"
        );
        mailService.sendAppointmentConfirmationEmail(snapshot);
        verifyNoInteractions(mailSender);
    }

    @Test
    @DisplayName("Email en blanco en snapshot → no se envía ningún email")
    void blankEmail_noEmailSent() {
        EmailAppointmentSnapshot snapshot = new EmailAppointmentSnapshot(
                "   ", "Prof", LocalDate.now(), LocalTime.now(), "SL998"
        );
        mailService.sendAppointmentConfirmationEmail(snapshot);
        verifyNoInteractions(mailSender);
    }

    @Test
    @DisplayName("Snapshot null → no lanza excepción")
    void nullSnapshot_noException() {
        assertThatNoException().isThrownBy(
                () -> mailService.sendAppointmentConfirmationEmail(null)
        );
        verifyNoInteractions(mailSender);
    }

    @Test
    @DisplayName("JavaMailSender lanza excepción → se captura y no se propaga")
    void mailSenderThrows_exceptionSwallowed() {
        doThrow(new RuntimeException("SMTP connection refused"))
                .when(mailSender).send(any(SimpleMailMessage.class));

        assertThatNoException().isThrownBy(
                () -> mailService.sendAppointmentConfirmationEmail(buildSnapshot("p@test.com", "SL997"))
        );
    }
}
