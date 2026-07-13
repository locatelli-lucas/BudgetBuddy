package com.budgetbuddy.domain.installment.dto;

import com.budgetbuddy.domain.installment.InstallmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstallmentEntryResponse {
    private UUID id;
    private int installmentNumber;
    private BigDecimal amount;
    private LocalDate dueDate;
    private InstallmentStatus status;
    private LocalDateTime paidAt;
}
