package com.agenda.backend.service;

import com.agenda.backend.controller.dto.AppointmentRequest;
import com.agenda.backend.exception.ResourceNotFoundException;
import com.agenda.backend.model.*;
import com.agenda.backend.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

@Service
public class AppointmentService {

    private static final int REMINDER_BATCH_SIZE = 100;

    private final AppointmentRepository appointmentRepository;
    private final ProfessionalRepository professionalRepository;
    private final ServiceRepository serviceRepository;
    private final PatientRepository patientRepository;
    private final MailService mailService;
    private final SecureRandom random = new SecureRandom();

    public AppointmentService(AppointmentRepository appointmentRepository,
                              ProfessionalRepository professionalRepository,
                              ServiceRepository serviceRepository,
                              PatientRepository patientRepository,
                              MailService mailService) {
        this.appointmentRepository = appointmentRepository;
        this.professionalRepository = professionalRepository;
        this.serviceRepository = serviceRepository;
        this.patientRepository = patientRepository;
        this.mailService = mailService;
    }

    @Transactional
    public Appointment createAppointment(AppointmentRequest request, Optional<User> authenticatedUser) {
        Professional professional = professionalRepository.findById(request.getProfessionalId())
                .orElseThrow(() -> new ResourceNotFoundException("Profesional no encontrado"));

        com.agenda.backend.model.Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Servicio no encontrado"));

        // Validate modality compatibility
        com.agenda.backend.model.ServiceModality modality =
                service.getModality() != null
                        ? service.getModality()
                        : com.agenda.backend.model.ServiceModality.PRESENCIAL;

        if (request.getLocationType() == LocationType.VIRTUAL && !modality.allowsVirtual()) {
            throw new IllegalStateException("Este servicio no está disponible en modalidad virtual");
        }
        if (request.getLocationType() == LocationType.OFFICE && !modality.allowsPresencial()) {
            throw new IllegalStateException("Este servicio no está disponible en modalidad presencial");
        }

        if (request.getLocationType() == LocationType.HOME) {
            if (!professional.isAllowsHomeVisit()) {
                throw new IllegalStateException("Este profesional no realiza visitas a domicilio");
            }
            if (professional.getHomeVisitFee() == null) {
                throw new IllegalStateException("El profesional aún no ha configurado su tarifa a domicilio");
            }
            if (request.getAddress() == null || request.getAddress().isBlank()) {
                throw new IllegalArgumentException("La dirección es obligatoria para visitas a domicilio");
            }
        }

        Optional<Appointment> existing = appointmentRepository.findByProfessionalIdAndDateAndTimeAndStatusNot(
                professional.getId(), request.getDate(), request.getTime(), AppointmentStatus.CANCELLED);
        
        if (existing.isPresent()) {
            throw new IllegalStateException("El profesional ya tiene una cita agendada para este horario");
        }

        Appointment appointment = new Appointment();
        appointment.setProfessional(professional);
        appointment.setService(service);
        appointment.setDate(request.getDate());
        appointment.setTime(request.getTime());
        appointment.setLocationType(request.getLocationType());
        appointment.setAddress(request.getAddress());
        appointment.setStatus(AppointmentStatus.PENDING);
        
        appointment.setPatientName(request.getPatientName());
        appointment.setPatientEmail(request.getPatientEmail());
        appointment.setPatientPhone(request.getPatientPhone());

        authenticatedUser.ifPresent(user -> {
            patientRepository.findById(user.getId()).ifPresent(appointment::setPatient);
        });

        BigDecimal total = service.getPrice();
        if (request.getLocationType() == LocationType.HOME && professional.getHomeVisitFee() != null) {
            total = total.add(professional.getHomeVisitFee());
        }
        appointment.setTotalPrice(total);

        appointment.setReservationCode(generateUniqueReservationCode());

        Appointment savedAppointment = appointmentRepository.save(appointment);
        mailService.sendAppointmentConfirmationEmail(buildEmailSnapshot(savedAppointment));
        return savedAppointment;
    }

    public Appointment findByCodeAndEmail(String code, String email) {
        Appointment appointment = appointmentRepository.findByReservationCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada con ese código"));

        if (!emailsMatch(appointment.getPatientEmail(), email)) {
            throw new IllegalArgumentException("El email no coincide con el código de reserva");
        }
        return appointment;
    }

    @Transactional
    public Appointment updateStatusByCode(String code, String email, AppointmentStatus newStatus) {
        if (newStatus != AppointmentStatus.CONFIRMED && newStatus != AppointmentStatus.CANCELLED) {
            throw new IllegalArgumentException("Solo se permite confirmar o anular la cita");
        }
        Appointment appointment = findByCodeAndEmail(code, email);
        AppointmentStatus previousStatus = appointment.getStatus();
        appointment.setStatus(newStatus);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        if (newStatus == AppointmentStatus.CANCELLED && previousStatus != AppointmentStatus.CANCELLED) {
            mailService.sendAppointmentCancellationEmail(buildEmailSnapshot(savedAppointment));
        }
        return savedAppointment;
    }

    @Transactional
    public Appointment updateStatusById(Long id, Long professionalId, AppointmentStatus newStatus) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada"));

        if (!appointment.getProfessional().getId().equals(professionalId)) {
            throw new IllegalArgumentException("No tienes permiso para gestionar esta cita");
        }

        AppointmentStatus previousStatus = appointment.getStatus();
        appointment.setStatus(newStatus);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        if (newStatus == AppointmentStatus.CANCELLED && previousStatus != AppointmentStatus.CANCELLED) {
            mailService.sendAppointmentCancellationEmail(buildEmailSnapshot(savedAppointment));
        }
        return savedAppointment;
    }

    @Transactional
    public void deleteCancelledAppointment(Long id, Long patientId) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada"));

        if (appointment.getPatient() == null || !appointment.getPatient().getId().equals(patientId)) {
            throw new IllegalArgumentException("No tienes permiso para eliminar esta cita");
        }

        if (appointment.getStatus() != AppointmentStatus.CANCELLED) {
            throw new IllegalStateException("Solo se pueden eliminar citas canceladas");
        }

        appointmentRepository.deleteById(id);
    }

    @Transactional
    public void deleteByProfessional(Long id, Long professionalId) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada"));

        if (appointment.getProfessional() == null || !appointment.getProfessional().getId().equals(professionalId)) {
            throw new IllegalArgumentException("No tienes permiso para eliminar esta cita");
        }

        appointmentRepository.deleteById(id);
    }

    public java.util.List<Appointment> listByPatientId(Long patientId) {
        return appointmentRepository.findAllByPatientId(patientId);
    }

    public java.util.List<Appointment> listByProfessionalId(Long professionalId) {
        return appointmentRepository.findAllByProfessionalId(professionalId);
    }

    public java.util.List<LocalTime> listOccupiedTimes(Long professionalId, LocalDate date) {
        return listOccupiedTimes(professionalId, date, null);
    }

    public java.util.List<LocalTime> listOccupiedTimes(Long professionalId, LocalDate date, Integer serviceDurationMinutes) {
        java.util.List<Appointment> appts = appointmentRepository
                .findAllByProfessionalIdAndDateAndStatusNot(professionalId, date, AppointmentStatus.CANCELLED);

        if (serviceDurationMinutes == null) {
            return appts.stream().map(Appointment::getTime).toList();
        }

        int D = serviceDurationMinutes;
        java.util.Set<Integer> blockedMinutes = new java.util.HashSet<>();

        for (Appointment a : appts) {
            LocalTime es = a.getTime();
            int existingDuration = 30;
            if (a.getService() != null && a.getService().getDurationMinutes() != null) {
                existingDuration = a.getService().getDurationMinutes();
            }
            LocalTime ee = es.plusMinutes(existingDuration);

            int esMin = es.getHour() * 60 + es.getMinute();
            int eeMin = ee.getHour() * 60 + ee.getMinute();

            int startMin = esMin - D + 1; // S must be > esMin - D, so S >= esMin - D + 1
            int endMin = eeMin - 1; // S < eeMin

            if (startMin < 0) startMin = 0;
            if (endMin > 24 * 60 - 1) endMin = 24 * 60 - 1;

            for (int m = startMin; m <= endMin; m++) {
                blockedMinutes.add(m);
            }
        }

        java.util.List<LocalTime> blocked = blockedMinutes.stream()
                .sorted()
                .map(min -> LocalTime.of(min / 60, min % 60))
                .toList();

        return blocked;
    }

    @Transactional
    public void sendReminderEmails() {
        LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);
        LocalDate currentDate = now.toLocalDate();
        LocalTime currentTime = now.toLocalTime();
        LocalDate nextDate = currentDate.plusDays(1);

        Pageable pageable = PageRequest.of(0, REMINDER_BATCH_SIZE);
        Page<Appointment> page;

        do {
            page = appointmentRepository.findAppointmentsForReminder(
                    currentDate,
                    currentTime,
                    nextDate,
                    AppointmentStatus.CANCELLED,
                    pageable
            );

            for (Appointment appointment : page.getContent()) {
                try {
                    mailService.sendAppointmentReminderEmail(buildEmailSnapshot(appointment));
                    appointment.setReminderSent(true);
                    appointmentRepository.save(appointment);
                } catch (Exception ex) {
                    org.slf4j.LoggerFactory.getLogger(AppointmentService.class)
                        .error("Error enviando recordatorio para cita {}: {}", appointment.getId(), ex.getMessage());
                }
            }

            pageable = page.hasNext() ? page.nextPageable() : Pageable.unpaged();
        } while (page.hasNext());
    }

    private String generateUniqueReservationCode() {
        String code;
        boolean exists;
        do {
            int number = random.nextInt(900000) + 100000;
            code = "SL" + number;
            exists = appointmentRepository.existsByReservationCode(code); 
        } while (exists);
        return code;
    }

    private EmailAppointmentSnapshot buildEmailSnapshot(Appointment source) {
        if (source == null) {
            return new EmailAppointmentSnapshot(null, null, null, null, null);
        }

        String professionalName = null;
        if (source.getProfessional() != null && source.getProfessional().getUser() != null) {
            professionalName = normalizeNullable(source.getProfessional().getUser().getName());
        }

        return new EmailAppointmentSnapshot(
                normalizeNullable(source.getPatientEmail()),
                professionalName,
                source.getDate(),
                source.getTime(),
                normalizeNullable(source.getReservationCode())
        );
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean emailsMatch(String leftEmail, String rightEmail) {
        String normalizedLeft = normalizeNullable(leftEmail);
        String normalizedRight = normalizeNullable(rightEmail);
        return normalizedLeft != null && normalizedLeft.equalsIgnoreCase(normalizedRight);
    }
}
