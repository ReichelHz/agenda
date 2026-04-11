package com.agenda.backend.repository;

import com.agenda.backend.model.PatientAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PatientAddressRepository extends JpaRepository<PatientAddress, Long> {
    List<PatientAddress> findAllByPatientId(Long patientId);
}
