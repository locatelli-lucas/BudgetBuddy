package com.budgetbuddy.domain.installment;

import com.budgetbuddy.domain.category.Category;
import com.budgetbuddy.domain.category.CategoryService;
import com.budgetbuddy.domain.category.dto.CategoryResponse;
import com.budgetbuddy.domain.financialresource.FinancialResource;
import com.budgetbuddy.domain.financialresource.FinancialResourceRepository;
import com.budgetbuddy.domain.financialresource.FinancialResourceService;
import com.budgetbuddy.domain.financialresource.FinancialResourceType;
import com.budgetbuddy.domain.installment.dto.InstallmentEntryResponse;
import com.budgetbuddy.domain.installment.dto.InstallmentPurchaseRequest;
import com.budgetbuddy.domain.installment.dto.InstallmentPurchaseResponse;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserService;
import com.budgetbuddy.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InstallmentService {

    private final InstallmentPurchaseRepository installmentPurchaseRepository;
    private final InstallmentEntryRepository installmentEntryRepository;
    private final UserService userService;
    private final CategoryService categoryService;
    private final FinancialResourceRepository financialResourceRepository;
    private final FinancialResourceService financialResourceService;

    @Transactional
    public InstallmentPurchaseResponse createInstallmentPurchase(String email, InstallmentPurchaseRequest request) {
        User user = userService.getUserByEmail(email);
        Category category = categoryService.getCategoryEntity(request.getCategoryId(), user.getId());
        FinancialResource financialResource = financialResourceRepository.findByIdAndUserId(request.getFinancialResourceId(), user.getId())
                .orElseThrow(() -> new EntityNotFoundException("FinancialResource", request.getFinancialResourceId().toString()));

        InstallmentPurchase purchase = InstallmentPurchase.builder()
                .user(user)
                .category(category)
                .financialResource(financialResource)
                .description(request.getDescription())
                .totalAmount(request.getTotalAmount())
                .installmentsCount(request.getInstallmentsCount())
                .purchaseDate(request.getPurchaseDate())
                .build();

        purchase = installmentPurchaseRepository.save(purchase);

        List<InstallmentEntry> entries = generateInstallments(purchase, request);
        purchase.setInstallments(entries);

        return mapToResponse(purchase);
    }

    private List<InstallmentEntry> generateInstallments(InstallmentPurchase purchase, InstallmentPurchaseRequest request) {
        List<InstallmentEntry> entries = new ArrayList<>();
        BigDecimal amountPerInstallment = purchase.getTotalAmount().divide(
                BigDecimal.valueOf(purchase.getInstallmentsCount()), 2, RoundingMode.HALF_UP);
        
        // Adjust for rounding differences in the last installment
        BigDecimal totalCalculated = amountPerInstallment.multiply(BigDecimal.valueOf(purchase.getInstallmentsCount()));
        BigDecimal difference = purchase.getTotalAmount().subtract(totalCalculated);

        FinancialResource fr = purchase.getFinancialResource();
        LocalDate baseDate = purchase.getPurchaseDate();

        for (int i = 1; i <= purchase.getInstallmentsCount(); i++) {
            BigDecimal currentAmount = amountPerInstallment;
            if (i == purchase.getInstallmentsCount()) {
                currentAmount = currentAmount.add(difference);
            }

            LocalDate dueDate = calculateDueDate(baseDate, i, fr);
            
            InstallmentStatus status = InstallmentStatus.PENDING;
            if (request.isHistorical() && i < request.getFirstInstallmentNumber()) {
                status = InstallmentStatus.PAID;
            }

            InstallmentEntry entry = InstallmentEntry.builder()
                    .purchase(purchase)
                    .installmentNumber(i)
                    .amount(currentAmount)
                    .dueDate(dueDate)
                    .status(status)
                    .build();
            
            entries.add(installmentEntryRepository.save(entry));
        }
        return entries;
    }

    private LocalDate calculateDueDate(LocalDate purchaseDate, int installmentNumber, FinancialResource fr) {
        // If it's a credit card, use closing/due days
        if (fr.getType() == FinancialResourceType.CREDIT_CARD) {
            Integer closingDay = fr.getInvoiceClosingDay();
            Integer dueDay = fr.getInvoiceDueDay();

            if (closingDay == null || dueDay == null) {
                // Fallback to same day next month
                return purchaseDate.plusMonths(installmentNumber - 1);
            }

            LocalDate invoiceDate;
            if (purchaseDate.getDayOfMonth() >= closingDay) {
                // Next month's invoice
                invoiceDate = purchaseDate.plusMonths(installmentNumber);
            } else {
                // Current month's invoice
                invoiceDate = purchaseDate.plusMonths(installmentNumber - 1);
            }
            
            // Set the due day, handling month length
            int lastDayOfMonth = invoiceDate.withDayOfMonth(invoiceDate.lengthOfMonth()).getDayOfMonth();
            int targetDay = Math.min(dueDay, lastDayOfMonth);
            return invoiceDate.withDayOfMonth(targetDay);
        }

        // For other methods, assume monthly frequency from purchase date
        return purchaseDate.plusMonths(installmentNumber - 1);
    }

    @Transactional(readOnly = true)
    public List<InstallmentPurchaseResponse> getInstallmentPurchases(String email) {
        User user = userService.getUserByEmail(email);
        return installmentPurchaseRepository.findAllByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InstallmentPurchaseResponse getInstallmentPurchase(String email, UUID id) {
        User user = userService.getUserByEmail(email);
        InstallmentPurchase purchase = installmentPurchaseRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("InstallmentPurchase", id.toString()));
        return mapToResponse(purchase);
    }

    private InstallmentPurchaseResponse mapToResponse(InstallmentPurchase purchase) {
        CategoryResponse categoryResponse = CategoryResponse.builder()
                .id(purchase.getCategory().getId())
                .name(purchase.getCategory().getName())
                .icon(purchase.getCategory().getIcon())
                .color(purchase.getCategory().getColor())
                .type(purchase.getCategory().getType())
                .build();

        return InstallmentPurchaseResponse.builder()
                .id(purchase.getId())
                .description(purchase.getDescription())
                .totalAmount(purchase.getTotalAmount())
                .installmentsCount(purchase.getInstallmentsCount())
                .purchaseDate(purchase.getPurchaseDate())
                .category(categoryResponse)
                .financialResource(financialResourceService.mapToResponse(purchase.getFinancialResource()))
                .installments(purchase.getInstallments().stream()
                        .map(this::mapEntryToResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private InstallmentEntryResponse mapEntryToResponse(InstallmentEntry entry) {
        return InstallmentEntryResponse.builder()
                .id(entry.getId())
                .installmentNumber(entry.getInstallmentNumber())
                .amount(entry.getAmount())
                .dueDate(entry.getDueDate())
                .status(entry.getStatus())
                .paidAt(entry.getPaidAt())
                .build();
    }
}
