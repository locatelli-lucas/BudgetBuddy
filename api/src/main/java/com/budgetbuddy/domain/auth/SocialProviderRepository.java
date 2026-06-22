package com.budgetbuddy.domain.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SocialProviderRepository extends JpaRepository<SocialProvider, UUID> {
    Optional<SocialProvider> findByProviderAndProviderId(AuthProvider provider, String providerId);
    List<SocialProvider> findByUserId(UUID userId);
    Optional<SocialProvider> findByUserIdAndProvider(UUID userId, AuthProvider provider);
    void deleteByUserIdAndProvider(UUID userId, AuthProvider provider);
}
