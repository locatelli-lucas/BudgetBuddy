package com.budgetbuddy.domain.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSecurityRepository extends JpaRepository<UserSecurity, UUID> {
    Optional<UserSecurity> findByUserId(UUID userId);
    Optional<UserSecurity> findByUserEmail(String email);
}
