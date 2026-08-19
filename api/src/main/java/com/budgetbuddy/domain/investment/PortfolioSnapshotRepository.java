package com.budgetbuddy.domain.investment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PortfolioSnapshotRepository extends JpaRepository<PortfolioSnapshot, UUID> {

    List<PortfolioSnapshot> findByUserIdAndSnapshotDateBetweenOrderBySnapshotDateAsc(
            UUID userId, LocalDate start, LocalDate end);

    Optional<PortfolioSnapshot> findByUserIdAndSnapshotDate(UUID userId, LocalDate date);

    @Query("SELECT p FROM PortfolioSnapshot p WHERE p.user.id = :userId ORDER BY p.snapshotDate DESC")
    List<PortfolioSnapshot> findLatestByUserId(UUID userId);

    boolean existsByUserIdAndSnapshotDate(UUID userId, LocalDate date);
}
