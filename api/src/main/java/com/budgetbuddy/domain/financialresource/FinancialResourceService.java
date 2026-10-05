package com.budgetbuddy.domain.financialresource;

import com.budgetbuddy.domain.financialinstitution.FinancialInstitution;
import com.budgetbuddy.domain.financialinstitution.FinancialInstitutionRepository;
import com.budgetbuddy.domain.financialinstitution.dto.FinancialInstitutionResponse;
import com.budgetbuddy.domain.financialresource.dto.CreditCardInvoiceResponse;
import com.budgetbuddy.domain.financialresource.dto.FinancialResourceRequest;
import com.budgetbuddy.domain.financialresource.dto.FinancialResourceResponse;
import com.budgetbuddy.domain.financialresource.dto.GroupedFinancialResourcesResponse;
import com.budgetbuddy.domain.installment.InstallmentEntry;
import com.budgetbuddy.domain.installment.InstallmentEntryRepository;
import com.budgetbuddy.domain.installment.InstallmentStatus;
import com.budgetbuddy.domain.transaction.Transaction;
import com.budgetbuddy.domain.transaction.TransactionRepository;
import com.budgetbuddy.domain.transaction.dto.TransactionResponse;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserService;
import com.budgetbuddy.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinancialResourceService {

    private final FinancialResourceRepository financialResourceRepository;
    private final UserService userService;
    private final FinancialInstitutionRepository financialInstitutionRepository;
    private final TransactionRepository transactionRepository;
    private final InstallmentEntryRepository installmentEntryRepository;

    @Transactional(readOnly = true)
    public List<FinancialResourceResponse> getFinancialResources(String email) {
        User user = userService.getUserByEmail(email);
        return financialResourceRepository.findAllByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FinancialResourceResponse getFinancialResource(String email, UUID id) {
        User user = userService.getUserByEmail(email);
        FinancialResource financialResource = financialResourceRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("FinancialResource", id.toString()));
        return mapToResponse(financialResource);
    }

    @Transactional
    public FinancialResourceResponse createFinancialResource(String email, FinancialResourceRequest request) {
        User user = userService.getUserByEmail(email);
        
        FinancialInstitution institution = null;
        if (request.getFinancialInstitutionId() != null) {
            institution = financialInstitutionRepository.findById(request.getFinancialInstitutionId())
                    .orElseThrow(() -> new EntityNotFoundException("FinancialInstitution", request.getFinancialInstitutionId().toString()));
        }

        FinancialResource financialResource = FinancialResource.builder()
                .user(user)
                .financialInstitution(institution)
                .name(request.getName())
                .type(request.getType())
                .brand(request.getBrand())
                .color(request.getColor())
                .lastFourDigits(request.getLastFourDigits())
                .creditLimit(request.getCreditLimit())
                .currentBalance(request.getCurrentBalance())
                .invoiceClosingDay(request.getInvoiceClosingDay())
                .invoiceDueDay(request.getInvoiceDueDay())
                .isActive(request.isActive())
                .build();

        financialResource = financialResourceRepository.save(financialResource);
        return mapToResponse(financialResource);
    }

    @Transactional
    public FinancialResourceResponse updateFinancialResource(String email, UUID id, FinancialResourceRequest request) {
        User user = userService.getUserByEmail(email);
        FinancialResource financialResource = financialResourceRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("FinancialResource", id.toString()));

        FinancialInstitution institution = null;
        if (request.getFinancialInstitutionId() != null) {
            institution = financialInstitutionRepository.findById(request.getFinancialInstitutionId())
                    .orElseThrow(() -> new EntityNotFoundException("FinancialInstitution", request.getFinancialInstitutionId().toString()));
        }

        financialResource.setFinancialInstitution(institution);
        financialResource.setName(request.getName());
        financialResource.setType(request.getType());
        financialResource.setBrand(request.getBrand());
        financialResource.setColor(request.getColor());
        financialResource.setLastFourDigits(request.getLastFourDigits());
        financialResource.setCreditLimit(request.getCreditLimit());
        financialResource.setCurrentBalance(request.getCurrentBalance());
        financialResource.setInvoiceClosingDay(request.getInvoiceClosingDay());
        financialResource.setInvoiceDueDay(request.getInvoiceDueDay());
        financialResource.setActive(request.isActive());

        financialResource = financialResourceRepository.save(financialResource);
        return mapToResponse(financialResource);
    }

    @Transactional
    public void deleteFinancialResource(String email, UUID id) {
        User user = userService.getUserByEmail(email);
        FinancialResource financialResource = financialResourceRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("FinancialResource", id.toString()));
        financialResourceRepository.delete(financialResource);
    }

    @Transactional(readOnly = true)
    public GroupedFinancialResourcesResponse getGroupedFinancialResources(String email) {
        User user = userService.getUserByEmail(email);
        List<FinancialResource> allResources = financialResourceRepository.findAllByUserId(user.getId());

        BigDecimal netWorth = allResources.stream()
                .filter(m -> m.getType() != FinancialResourceType.CREDIT_CARD)
                .map(m -> m.getCurrentBalance() != null ? m.getCurrentBalance() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        var grouped = allResources.stream()
                .collect(Collectors.groupingBy(m -> 
                    m.getFinancialInstitution() != null ? m.getFinancialInstitution().getName() : "Outros"
                ));

        List<GroupedFinancialResourcesResponse.FinancialInstitutionGroupResponse> institutionGroups = grouped.entrySet().stream()
                .map(entry -> {
                    String name = entry.getKey();
                    List<FinancialResource> resources = entry.getValue();
                    
                    String logoUrl = resources.stream()
                            .filter(m -> m.getFinancialInstitution() != null && m.getFinancialInstitution().getLogoUrl() != null)
                            .map(m -> m.getFinancialInstitution().getLogoUrl())
                            .findFirst().orElse(null);

                    BigDecimal totalBalance = resources.stream()
                            .filter(m -> m.getType() != FinancialResourceType.CREDIT_CARD)
                            .map(m -> m.getCurrentBalance() != null ? m.getCurrentBalance() : BigDecimal.ZERO)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return GroupedFinancialResourcesResponse.FinancialInstitutionGroupResponse.builder()
                            .institutionName(name)
                            .logoUrl(logoUrl)
                            .totalBalance(totalBalance)
                            .resourceCount(resources.size())
                            .financialResources(resources.stream().map(this::mapToResponse).collect(Collectors.toList()))
                            .build();
                })
                .sorted((a, b) -> a.getInstitutionName().compareToIgnoreCase(b.getInstitutionName()))
                .collect(Collectors.toList());

        return GroupedFinancialResourcesResponse.builder()
                .netWorth(netWorth)
                .institutions(institutionGroups)
                .build();
    }

    @Transactional(readOnly = true)
    public CreditCardInvoiceResponse getInvoice(String email, UUID resourceId, int month, int year) {
        User user = userService.getUserByEmail(email);
        FinancialResource fr = financialResourceRepository.findByIdAndUserId(resourceId, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("FinancialResource", resourceId.toString()));

        if (fr.getType() != FinancialResourceType.CREDIT_CARD) {
            throw new IllegalArgumentException("Resource is not a credit card");
        }

        Integer closingDay = fr.getInvoiceClosingDay();
        Integer dueDay = fr.getInvoiceDueDay();

        if (closingDay == null || dueDay == null) {
            throw new IllegalArgumentException("Card closing and due days must be configured");
        }

        // Calculate dates
        LocalDate dueDate = LocalDate.of(year, month, Math.min(dueDay, LocalDate.of(year, month, 1).lengthOfMonth()));
        
        // Billing cycle: ClosingDay(Month-1) to ClosingDay(Month)-1
        LocalDate cycleEnd = LocalDate.of(year, month, Math.min(closingDay, LocalDate.of(year, month, 1).lengthOfMonth())).minusDays(1);
        LocalDate cycleStart = cycleEnd.minusMonths(1).plusDays(1);

        // 1. Transactions in cycle
        List<Transaction> transactions = transactionRepository.findAllByFinancialResourceIdAndDateBetween(resourceId, cycleStart, cycleEnd);

        // 2. Installments with due date in this invoice
        List<InstallmentEntry> installments = installmentEntryRepository.findAllByPurchaseFinancialResourceIdAndDueDate(resourceId, dueDate);

        BigDecimal totalAmount = transactions.stream().map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add)
                .add(installments.stream().map(InstallmentEntry::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add));

        boolean isPaid = installments.isEmpty() || installments.stream().allMatch(i -> i.getStatus() == InstallmentStatus.PAID);

        return CreditCardInvoiceResponse.builder()
                .financialResourceId(resourceId)
                .cardName(fr.getName())
                .month(month)
                .year(year)
                .dueDate(dueDate)
                .closingDate(cycleEnd.plusDays(1)) // The closing day itself
                .totalAmount(totalAmount)
                .isPaid(isPaid)
                .transactions(transactions.stream().map(this::mapTransactionToResponse).collect(Collectors.toList()))
                .installments(installments.stream().map(i -> CreditCardInvoiceResponse.InstallmentInvoiceItem.builder()
                        .description(i.getPurchase().getDescription())
                        .currentInstallment(i.getInstallmentNumber())
                        .totalInstallments(i.getPurchase().getInstallmentsCount())
                        .amount(i.getAmount())
                        .purchaseDate(i.getPurchase().getPurchaseDate())
                        .build()).collect(Collectors.toList()))
                .build();
    }

    private TransactionResponse mapTransactionToResponse(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .amount(t.getAmount())
                .description(t.getDescription())
                .date(t.getDate())
                .type(t.getType())
                .build();
    }

    public FinancialResourceResponse mapToResponse(FinancialResource financialResource) {
        FinancialInstitutionResponse institutionResponse = null;
        if (financialResource.getFinancialInstitution() != null) {
            FinancialInstitution inst = financialResource.getFinancialInstitution();
            institutionResponse = FinancialInstitutionResponse.builder()
                    .id(inst.getId())
                    .name(inst.getName())
                    .brokerCode(inst.getBrokerCode())
                    .logoUrl(inst.getLogoUrl())
                    .build();
        }

        return FinancialResourceResponse.builder()
                .id(financialResource.getId())
                .name(financialResource.getName())
                .type(financialResource.getType())
                .brand(financialResource.getBrand())
                .color(financialResource.getColor())
                .lastFourDigits(financialResource.getLastFourDigits())
                .creditLimit(financialResource.getCreditLimit())
                .currentBalance(financialResource.getCurrentBalance())
                .invoiceClosingDay(financialResource.getInvoiceClosingDay())
                .invoiceDueDay(financialResource.getInvoiceDueDay())
                .isActive(financialResource.isActive())
                .financialInstitution(institutionResponse)
                .createdAt(financialResource.getCreatedAt())
                .updatedAt(financialResource.getUpdatedAt())
                .build();
    }
}
