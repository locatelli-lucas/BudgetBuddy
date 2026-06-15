package com.budgetbuddy.domain.institution;

import com.budgetbuddy.domain.institution.dto.InstitutionRequest;
import com.budgetbuddy.domain.institution.dto.InstitutionResponse;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserRepository;
import com.budgetbuddy.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InstitutionService {

    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<InstitutionResponse> getInstitutions(String email) {
        return institutionRepository.findByUserEmail(email).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public InstitutionResponse createInstitution(String email, InstitutionRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User", email));

        Institution institution = Institution.builder()
                .user(user)
                .name(request.getName())
                .brokerCode(request.getBrokerCode())
                .logoUrl(request.getLogoUrl())
                .build();

        institution = institutionRepository.save(institution);
        return mapToResponse(institution);
    }

    @Transactional
    public void deleteInstitution(String email, UUID id) {
        Institution institution = institutionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Institution", id.toString()));

        if (!institution.getUser().getEmail().equals(email)) {
            throw new EntityNotFoundException("Institution", id.toString());
        }

        institutionRepository.delete(institution);
    }

    private InstitutionResponse mapToResponse(Institution institution) {
        return InstitutionResponse.builder()
                .id(institution.getId())
                .name(institution.getName())
                .brokerCode(institution.getBrokerCode())
                .logoUrl(institution.getLogoUrl())
                .build();
    }
}
