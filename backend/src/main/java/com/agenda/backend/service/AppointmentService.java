package com.agenda.backend.service;

import com.agenda.backend.controller.dto.AppointmentRequest;
import com.agenda.backend.exception.ResourceNotFoundException;
import com.agenda.backend.model.*;
import com.agenda.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.Optional;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final ProfessionalRepository professionalRepository;
    private final ServiceRepository serviceRepository;
    private final PatientRepository patientRepository;
    private final SecureRandom random = new SecureRandom();

    public AppointmentService(AppointmentRepository appointmentRepository,
                              ProfessionalRepository professionalRepository,
                              ServiceRepository serviceRepository,
                              PatientRepository patientRepository) {
        this.appointmentRepository = appointmentRepository;
        this.professionalRepository = professionalRepository;
        this.serviceRepository = serviceRepository;
        this.patientRepository = patientRepository;
    }

    @Transactional
    public Appointment createAppointment(AppointmentRequest request, Optional<User> authenticatedUser) {
        Professional professional = professionalRepository.findById(request.getProfessionalId())
                .orElseThrow(() -> new ResourceNotFoundException("Profesional no encontrado"));

        com.agenda.backend.model.Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Servicio no encontrado"));

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

        return appointmentRepository.save(appointment);
    }

    public Appointment findByCodeAndEmail(String code, String email) {
        Appointment appointment = appointmentRepository.findByReservationCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada con ese código"));

        if (!appointment.getPatientEmail().equalsIgnoreCase(email.trim())) {
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
        appointment.setStatus(newStatus);
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment updateStatusById(Long id, Long professionalId, AppointmentStatus newStatus) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada"));

        if (!appointment.getProfessional().getId().equals(professionalId)) {
            throw new IllegalArgumentException("No tienes permiso para gestionar esta cita");
        }

        appointment.setStatus(newStatus);
        return appointmentRepository.save(appointment);
    }

    public java.util.List<Appointment> listByPatientId(Long patientId) {
        return appointmentRepository.findAllByPatientId(patientId);
    }

    public java.util.List<Appointment> listByProfessionalId(Long professionalId) {
        return appointmentRepository.findAllByProfessionalId(professionalId);
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
}
