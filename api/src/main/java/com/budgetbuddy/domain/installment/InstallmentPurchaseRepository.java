package com.budgetbuddy.domain.installment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InstallmentPurchaseRepository extends JpaRepository<InstallmentPurchase, UUID> {
    List<InstallmentPurchase> findAllByUserId(UUID userId);
    Optional<InstallmentPurchase> findByIdAndUserId(UUID id, UUID userId);
}
