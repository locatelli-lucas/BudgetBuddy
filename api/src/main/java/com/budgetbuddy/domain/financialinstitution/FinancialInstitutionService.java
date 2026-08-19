package com.budgetbuddy.domain.financialinstitution;

import com.budgetbuddy.domain.financialinstitution.dto.FinancialInstitutionRequest;
import com.budgetbuddy.domain.financialinstitution.dto.FinancialInstitutionResponse;
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
public class FinancialInstitutionService {

    private final FinancialInstitutionRepository financialInstitutionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<FinancialInstitutionResponse> getInstitutions(String email) {
        return financialInstitutionRepository.findByUserEmail(email).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public FinancialInstitutionResponse createInstitution(String email, FinancialInstitutionRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User", email));

        FinancialInstitution institution = FinancialInstitution.builder()
                .user(user)
                .name(request.getName())
                .brokerCode(request.getBrokerCode())
                .logoUrl(request.getLogoUrl())
                .build();

        institution = financialInstitutionRepository.save(institution);
        return mapToResponse(institution);
    }

    @Transactional
    public void deleteInstitution(String email, UUID id) {
        FinancialInstitution institution = financialInstitutionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FinancialInstitution", id.toString()));

        if (!institution.getUser().getEmail().equals(email)) {
            throw new EntityNotFoundException("FinancialInstitution", id.toString());
        }

        financialInstitutionRepository.delete(institution);
    }

    private FinancialInstitutionResponse mapToResponse(FinancialInstitution institution) {
        return FinancialInstitutionResponse.builder()
                .id(institution.getId())
                .name(institution.getName())
                .brokerCode(institution.getBrokerCode())
                .logoUrl(institution.getLogoUrl())
                .build();
    }
}
