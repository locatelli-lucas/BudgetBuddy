package com.budgetbuddy.domain.goal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GoalRepository extends JpaRepository<Goal, UUID> {
    List<Goal> findAllByUserId(UUID userId);
    Optional<Goal> findByIdAndUserId(UUID id, UUID userId);
}
