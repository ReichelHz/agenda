package com.agenda.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private static final String CONFIRMATION_SUBJECT = "Confirmación de cita";
    private static final String CANCELLATION_SUBJECT = "Cancelación de cita";

    private static final String CONFIRMATION_TITLE = "Tu cita fue registrada exitosamente.";
    private static final String CANCELLATION_TITLE = "Tu cita fue cancelada exitosamente.";

    private final JavaMailSender mailSender;
    private final String from;

    public MailService(JavaMailSender mailSender,
                       @Value("${app.mail.from}") String from) {
        this.mailSender = mailSender;
        this.from = from;
    }

    // =========================
    // PUBLIC API
    // =========================

    // 🔥 QUITAMOS @Async TEMPORALMENTE PARA DEBUG REAL
    public void sendAppointmentConfirmationEmail(EmailAppointmentSnapshot snapshot) {
        send(snapshot, CONFIRMATION_SUBJECT, CONFIRMATION_TITLE, "confirmación");
    }

    public void sendAppointmentCancellationEmail(EmailAppointmentSnapshot snapshot) {
        send(snapshot, CANCELLATION_SUBJECT, CANCELLATION_TITLE, "cancelación");
    }

    // =========================
    // CORE
    // =========================

    private void send(EmailAppointmentSnapshot snapshot,
                      String subject,
                      String title,
                      String eventType) {

        try {
            if (snapshot == null) {
                log.warn("Se omite email de {} porque snapshot es null", eventType);
                return;
            }

            String email = safeEmail(snapshot);
            String code = safeCode(snapshot);

            if (email == null) {
                log.warn("Se omite email de {} para reserva {} (sin destinatario)",
                        eventType, code);
                return;
            }

            log.info("🔥 INTENTANDO ENVIAR EMAIL A: {}", email);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(email);
            message.setSubject(subject);
            message.setText(buildBody(title, snapshot));

            mailSender.send(message);

            log.info("✅ Email de {} enviado correctamente para reserva {}",
                    eventType, code);

        } catch (Exception ex) {
            log.error("❌ Error enviando email de {} para reserva {}",
                    eventType, safeCode(snapshot), ex);
        }
    }

    // =========================
    // BODY
    // =========================

    private String buildBody(String title, EmailAppointmentSnapshot s) {
        return title + "\n\n"
                + "Profesional: " + safeText(s.professionalName(), "Profesional") + "\n"
                + "Fecha: " + (s.date() != null ? s.date() : "No especificada") + "\n"
                + "Hora: " + (s.time() != null ? s.time() : "No especificada") + "\n"
                + "Código de reserva: " + safeText(s.reservationCode(), "No disponible") + "\n";
    }

    // =========================
    // SAFETY HELPERS
    // =========================

    private String safeEmail(EmailAppointmentSnapshot s) {
        if (s.patientEmail() == null || s.patientEmail().isBlank()) return null;
        return s.patientEmail().trim();
    }

    private String safeCode(EmailAppointmentSnapshot s) {
        return safeText(s.reservationCode(), "N/A");
    }

    private String safeText(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value;
    }
}