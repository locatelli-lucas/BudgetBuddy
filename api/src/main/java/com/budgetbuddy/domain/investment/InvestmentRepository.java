package com.budgetbuddy.domain.investment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvestmentRepository extends JpaRepository<Investment, UUID> {
    
    List<Investment> findByUserId(UUID userId);
    
    Optional<Investment> findByIdAndUserId(UUID id, UUID userId);
    
    List<Investment> findByUserIdAndTicker(UUID userId, String ticker);

    /** Returns all distinct tickers tracked by any user (excluding FIXED_INCOME). */
    @Query("SELECT DISTINCT i.ticker FROM Investment i WHERE i.type != com.budgetbuddy.domain.investment.Investment.InvestmentType.FIXED_INCOME")
    List<String> findDistinctTickers();

    /** Returns all investments for a given ticker (across all users). */
    List<Investment> findByTicker(String ticker);
}

