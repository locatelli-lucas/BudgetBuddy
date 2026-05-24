package com.budgetbuddy.domain.insight;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AiInsightRepository extends JpaRepository<AiInsight, UUID> {
    
    List<AiInsight> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    List<AiInsight> findTop20ByUserIdOrderByCreatedAtDesc(UUID userId);
    
    Optional<AiInsight> findByIdAndUserId(UUID id, UUID userId);
    
    @Modifying
    @Query("UPDATE AiInsight a SET a.isRead = true WHERE a.user.id = :userId")
    void markAllAsReadForUser(UUID userId);
}
