package com.budgetbuddy.domain.notification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    
    Page<Notification> findByUserIdOrderBySentAtDesc(UUID userId, Pageable pageable);
    
    Optional<Notification> findByIdAndUserId(UUID id, UUID userId);
    
    long countByUserIdAndIsReadFalse(UUID userId);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId")
    void markAllAsReadForUser(UUID userId);
}
