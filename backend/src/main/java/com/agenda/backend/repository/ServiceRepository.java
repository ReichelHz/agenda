package com.agenda.backend.repository;

import com.agenda.backend.model.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    Page<Service> findByProfessionalIsNotNullAndActiveTrue(Pageable pageable);
    Page<Service> findByProfessionalIsNotNullAndActiveTrueAndNameContainingIgnoreCase(String name, Pageable pageable);
    List<Service> findByProfessionalIdAndActiveTrue(Long professionalId);
}
