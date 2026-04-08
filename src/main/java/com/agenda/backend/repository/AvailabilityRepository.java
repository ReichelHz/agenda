package com.agenda.backend.repository;

import com.agenda.backend.model.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    List<Availability> findByProfessionalId(Long professionalId);
}
