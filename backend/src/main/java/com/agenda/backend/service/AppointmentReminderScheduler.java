package com.agenda.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Componente encargado de enviar recordatorios de citas automáticamente.
 * Se ejecuta cada 30 minutos para verificar citas próximas en las siguientes 24 horas.
 */
@Component
public class AppointmentReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(AppointmentReminderScheduler.class);

    private final AppointmentService appointmentService;

    public AppointmentReminderScheduler(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    /**
     * Tarea programada que envía recordatorios cada 30 minutos.
     * Se ejecuta automáticamente sin necesidad de invocación manual.
     */
    @Scheduled(initialDelay = 60000, fixedDelay = 1800000) // Espera 1 minuto al iniciar y luego cada 30 minutos tras finalizar
    public void sendAppointmentReminders() {
        try {
            log.info("🔔 Iniciando verificación de recordatorios de citas...");
            appointmentService.sendReminderEmails();
            log.info("✅ Verificación de recordatorios completada");
        } catch (Exception ex) {
            log.error("❌ Error en la verificación de recordatorios: {}", ex.getMessage(), ex);
        }
    }
}
