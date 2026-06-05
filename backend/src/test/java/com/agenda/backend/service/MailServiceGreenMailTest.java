package com.agenda.backend.service;

import com.icegreen.greenmail.util.GreenMail;
import com.icegreen.greenmail.util.ServerSetup;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test de integración: MailService → servidor SMTP embebido GreenMail.
 *
 * Verifica que el email realmente llega al buzón del destinatario
 * con el asunto, destinatario y contenido correctos, sin necesidad
 * de una cuenta SMTP externa ni del contexto de Spring Boot.
 */
class MailServiceGreenMailTest {

    private static final int    SMTP_PORT    = 3025;
    private static final String FRONTEND_URL = "http://localhost:3000";
    private static final String FROM         = "noreply@agenda.test";

    private GreenMail   greenMail;
    private MailService mailService;

    @BeforeEach
    void setUp() {
        // Arranca servidor SMTP en memoria en el puerto 3025
        ServerSetup setup = new ServerSetup(SMTP_PORT, "localhost", ServerSetup.PROTOCOL_SMTP);
        greenMail = new GreenMail(setup);
        greenMail.start();

        // Configura JavaMailSenderImpl apuntando al GreenMail
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost("localhost");
        sender.setPort(SMTP_PORT);

        Properties props = new Properties();
        props.put("mail.smtp.auth",               "false");
        props.put("mail.smtp.starttls.enable",     "false");
        props.put("mail.smtp.connectiontimeout",   "2000");
        props.put("mail.smtp.timeout",             "2000");
        sender.setJavaMailProperties(props);

        mailService = new MailService(sender, FROM, FRONTEND_URL);
    }

    @AfterEach
    void tearDown() {
        greenMail.stop();
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────

    private EmailAppointmentSnapshot snapshot(String email, String code) {
        return new EmailAppointmentSnapshot(
                email,
                "Dra. Stefani Leiva",
                LocalDate.of(2025, 7, 15),
                LocalTime.of(10, 30),
                code
        );
    }

    // ─────────────────────────────────────────────────────────────
    // Email de confirmación
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Confirmación: GreenMail recibe exactamente 1 email")
    void confirmation_oneEmailReceived() throws Exception {
        mailService.sendAppointmentConfirmationEmail(snapshot("paciente@test.com", "SL111111"));

        assertThat(greenMail.waitForIncomingEmail(3_000, 1))
                .as("GreenMail debería haber recibido al menos 1 email")
                .isTrue();
        assertThat(greenMail.getReceivedMessages()).hasSize(1);
    }

    @Test
    @DisplayName("Confirmación: destinatario es el email del paciente")
    void confirmation_recipientIsPatientEmail() throws Exception {
        mailService.sendAppointmentConfirmationEmail(snapshot("paciente@test.com", "SL111112"));

        greenMail.waitForIncomingEmail(3_000, 1);
        MimeMessage msg = greenMail.getReceivedMessages()[0];

        assertThat(msg.getAllRecipients())
                .hasSize(1)
                .extracting(Object::toString)
                .containsExactly("paciente@test.com");
    }

    @Test
    @DisplayName("Confirmación: asunto del email es 'Confirmación de cita'")
    void confirmation_subjectIsCorrect() throws Exception {
        mailService.sendAppointmentConfirmationEmail(snapshot("p@test.com", "SL111113"));

        greenMail.waitForIncomingEmail(3_000, 1);
        MimeMessage msg = greenMail.getReceivedMessages()[0];

        assertThat(msg.getSubject()).isEqualTo("Confirmación de cita");
    }

    @Test
    @DisplayName("Confirmación: cuerpo contiene el código de reserva")
    void confirmation_bodyContainsReservationCode() throws Exception {
        mailService.sendAppointmentConfirmationEmail(snapshot("p@test.com", "SL111114"));

        greenMail.waitForIncomingEmail(3_000, 1);
        String body = (String) greenMail.getReceivedMessages()[0].getContent();

        assertThat(body).contains("SL111114");
    }

    @Test
    @DisplayName("Confirmación: cuerpo contiene el link de gestión de la cita")
    void confirmation_bodyContainsManagementLink() throws Exception {
        mailService.sendAppointmentConfirmationEmail(snapshot("paciente@test.com", "SL111115"));

        greenMail.waitForIncomingEmail(3_000, 1);
        String body = (String) greenMail.getReceivedMessages()[0].getContent();

        assertThat(body)
                .contains(FRONTEND_URL + "/citas/SL111115")
                .contains("paciente%40test.com");
    }

    @Test
    @DisplayName("Confirmación: cuerpo contiene nombre del profesional y fecha")
    void confirmation_bodyContainsProfessionalAndDate() throws Exception {
        mailService.sendAppointmentConfirmationEmail(snapshot("p@test.com", "SL111116"));

        greenMail.waitForIncomingEmail(3_000, 1);
        String body = (String) greenMail.getReceivedMessages()[0].getContent();

        assertThat(body)
                .contains("Dra. Stefani Leiva")
                .contains("2025-07-15");
    }

    // ─────────────────────────────────────────────────────────────
    // Email de cancelación
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Cancelación: GreenMail recibe email con asunto correcto")
    void cancellation_emailReceivedWithCorrectSubject() throws Exception {
        mailService.sendAppointmentCancellationEmail(snapshot("paciente@test.com", "SL222222"));

        greenMail.waitForIncomingEmail(3_000, 1);
        MimeMessage msg = greenMail.getReceivedMessages()[0];

        assertThat(msg.getSubject()).isEqualTo("Cancelación de cita");
        assertThat(msg.getAllRecipients()[0].toString()).isEqualTo("paciente@test.com");
    }

    // ─────────────────────────────────────────────────────────────
    // Email de recordatorio
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Recordatorio: GreenMail recibe email con asunto correcto")
    void reminder_emailReceivedWithCorrectSubject() throws Exception {
        mailService.sendAppointmentReminderEmail(snapshot("paciente@test.com", "SL333333"));

        greenMail.waitForIncomingEmail(3_000, 1);
        MimeMessage msg = greenMail.getReceivedMessages()[0];

        assertThat(msg.getSubject()).isEqualTo("Recordatorio de tu cita");
    }

    // ─────────────────────────────────────────────────────────────
    // Caso borde: email nulo → no llega nada a GreenMail
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Email nulo: GreenMail no recibe ningún mensaje")
    void nullEmail_noMessageDelivered() throws Exception {
        EmailAppointmentSnapshot bad = new EmailAppointmentSnapshot(
                null, "Prof", LocalDate.now(), LocalTime.now(), "SL999"
        );
        mailService.sendAppointmentConfirmationEmail(bad);

        boolean received = greenMail.waitForIncomingEmail(1_000, 1);
        assertThat(received).isFalse();
        assertThat(greenMail.getReceivedMessages()).isEmpty();
    }
}
