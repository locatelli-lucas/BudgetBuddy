package com.budgetbuddy.domain.installment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface InstallmentEntryRepository extends JpaRepository<InstallmentEntry, UUID> {
    List<InstallmentEntry> findAllByPurchaseIdOrderByInstallmentNumberAsc(UUID purchaseId);
    List<InstallmentEntry> findAllByPurchaseUserIdAndDueDateBetween(UUID userId, LocalDate startDate, LocalDate endDate);
}
