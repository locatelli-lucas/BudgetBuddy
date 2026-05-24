package com.budgetbuddy.domain.investment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvestmentRepository extends JpaRepository<Investment, UUID> {
    
    List<Investment> findByUserId(UUID userId);
    
    Optional<Investment> findByIdAndUserId(UUID id, UUID userId);
    
    List<Investment> findByUserIdAndTicker(UUID userId, String ticker);
}
