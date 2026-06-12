package com.budgetbuddy.domain.category;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findByUserIdOrIsDefaultTrue(UUID userId);
    List<Category> findByUserId(UUID userId);
    Optional<Category> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT c FROM Category c WHERE c.id = :id AND (c.user.id = :userId OR c.isDefault = true)")
    Optional<Category> findByIdAndUserIdOrIsDefaultTrue(UUID id, UUID userId);
}
