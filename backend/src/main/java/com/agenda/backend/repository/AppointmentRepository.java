package com.agenda.backend.repository;

import com.agenda.backend.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    boolean existsByReservationCode(String reservationCode);
    Optional<Appointment> findByReservationCode(String reservationCode);
    java.util.List<Appointment> findAllByPatientEmailIgnoreCaseAndPatientIsNull(String email);
    
    java.util.Optional<Appointment> findByProfessionalIdAndDateAndTimeAndStatusNot(
        Long professionalId, 
        java.time.LocalDate date, 
        java.time.LocalTime time, 
        com.agenda.backend.model.AppointmentStatus status
    );

    java.util.List<Appointment> findAllByPatientId(Long patientId);
    java.util.List<Appointment> findAllByProfessionalId(Long professionalId);
}
