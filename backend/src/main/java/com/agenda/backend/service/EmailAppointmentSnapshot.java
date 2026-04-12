package com.agenda.backend.service;

import java.time.LocalDate;
import java.time.LocalTime;

record EmailAppointmentSnapshot(
        String patientEmail,
        String professionalName,
        LocalDate date,
        LocalTime time,
        String reservationCode
) {

    public EmailAppointmentSnapshot {
        patientEmail = normalizeEmail(patientEmail);
        professionalName = normalizeText(professionalName);
        reservationCode = normalizeText(reservationCode);
    }

    private static String normalizeText(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private static String normalizeEmail(String value) {
        if (value == null) return null;
        String trimmed = value.trim().toLowerCase();
        return trimmed.isBlank() ? null : trimmed;
    }
}