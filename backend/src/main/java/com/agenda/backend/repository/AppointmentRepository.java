package com.agenda.backend.repository;

import com.agenda.backend.model.Appointment;
import com.agenda.backend.model.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
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
    
    @Query(
        "SELECT a FROM Appointment a WHERE a.reminderSent = false " +
        "AND a.status <> :excludedStatus " +
        "AND ((a.date = :currentDate AND a.time >= :currentTime) " +
        "OR (a.date = :nextDate AND a.time < :currentTime)) " +
        "ORDER BY a.date ASC, a.time ASC"
    )
    Page<Appointment> findAppointmentsForReminder(
        @Param("currentDate") LocalDate currentDate,
        @Param("currentTime") LocalTime currentTime,
        @Param("nextDate") LocalDate nextDate,
        @Param("excludedStatus") AppointmentStatus excludedStatus,
        Pageable pageable
    );
}
