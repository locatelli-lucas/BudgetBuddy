package com.budgetbuddy.project.dto.account.res;

import com.budgetbuddy.project.entities.Account;
import com.budgetbuddy.project.types.AccountTypes;

public record AccountDTORes(
        Long id,
        Long userId,
        String accountName,
        AccountTypes accountType,
        double balance,
        String branchName,
        String accountNumber,
        String icon
) {
    public static AccountDTORes accountToDto(Account account) {
        return new AccountDTORes(
                account.getId(),
                account.getUser().getId(),
                account.getAccountName(),
                account.getAccountType(),
                account.getBalance(),
                account.getBranchName(),
                account.getAccountNumber(),
                account.getIcon()
        );
    }
}
