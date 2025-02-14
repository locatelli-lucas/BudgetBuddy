package com.budgetbuddy.project.dto.account.req;

import com.budgetbuddy.project.entities.Account;
import com.budgetbuddy.project.entities.User;
import com.budgetbuddy.project.types.AccountTypes;
import jakarta.validation.constraints.*;
import lombok.Value;
import org.hibernate.validator.constraints.CreditCardNumber;

import java.io.Serializable;

public record AccountDTOReq(
        @NotNull(message = "User is required")
        User user,

        @NotNull(message = "Account name is required")
        String accountName,

        @NotNull(message = "Account type is required")
        AccountTypes accountType,

        @PositiveOrZero(message = "Balance must be a positive number or zero")
        @NotNull(message = "Balance is required")
        @NotBlank(message = "Balance is required")
        double balance,

        String branchName,

        @CreditCardNumber(message = "Account number is invalid")
        String accountNumber,

        String icon
) {
    public Account dtoToAccount() {
        return new Account(
                this.user(),
                this.accountName(),
                this.accountType(),
                this.balance(),
                this.branchName(),
                this.accountNumber(),
                this.icon()
        );
    }

    public Account dtoToAccount(Long id) {
        return new Account(
                id,
                this.user(),
                this.accountName(),
                this.accountType(),
                this.balance(),
                this.branchName(),
                this.accountNumber(),
                this.icon()
        );
    }

}