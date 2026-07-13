package com.budgetbuddy.domain.financialresource;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FinancialResourceRepository extends JpaRepository<FinancialResource, UUID> {
    List<FinancialResource> findAllByUserId(UUID userId);
    Optional<FinancialResource> findByIdAndUserId(UUID id, UUID userId);
}
