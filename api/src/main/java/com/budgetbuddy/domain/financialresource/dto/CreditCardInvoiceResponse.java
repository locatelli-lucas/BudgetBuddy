package com.budgetbuddy.domain.financialresource.dto;

import com.budgetbuddy.domain.transaction.dto.TransactionResponse;
import com.budgetbuddy.domain.installment.dto.InstallmentEntryResponse;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
public class CreditCardInvoiceResponse {
    private UUID financialResourceId;
    private String cardName;
    private int month;
    private int year;
    private LocalDate dueDate;
    private LocalDate closingDate;
    private BigDecimal totalAmount;
    private boolean isPaid;
    private List<TransactionResponse> transactions;
    private List<InstallmentInvoiceItem> installments;

    @Getter
    @Setter
    @Builder
    public static class InstallmentInvoiceItem {
        private String description;
        private int currentInstallment;
        private int totalInstallments;
        private BigDecimal amount;
        private LocalDate purchaseDate;
    }
}
