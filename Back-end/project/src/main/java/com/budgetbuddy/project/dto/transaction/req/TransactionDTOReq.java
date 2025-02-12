package com.budgetbuddy.project.dto.transaction.req;

import com.budgetbuddy.project.entities.Account;
import com.budgetbuddy.project.entities.Transaction;
import com.budgetbuddy.project.types.StatusTypes;
import com.budgetbuddy.project.types.TransactionTypes;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Date;

public record TransactionDTOReq(
        @NotNull(message = "Account is required")
        Account account,

        @NotNull(message = "Date is required")
        Date date,

        @NotNull(message = "Status is required")
        StatusTypes status,

        @NotNull(message = "Transaction type is required")
        TransactionTypes transactionType,

        String receipt,

        @NotNull(message = "Amount is required")
        double amount,

        @NotNull(message = "Item is required")
        String item,

        String icon,

        @NotNull(message = "Shop name is required")
        @NotBlank(message = "Shop name cannot be blank")
        String shopName
) {
    public Transaction dtoToTransaction() {
        return new Transaction(
                this.account,
                this.date,
                this.status,
                this.transactionType,
                this.receipt,
                this.amount,
                this.item,
                this.icon,
                this.shopName
        );
    }
}
