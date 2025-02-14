package com.budgetbuddy.project.dto.transaction.req;

import com.budgetbuddy.project.entities.Account;
import com.budgetbuddy.project.entities.Transaction;
import com.budgetbuddy.project.types.StatusTypes;
import com.budgetbuddy.project.types.TransactionTypes;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Date;

public record TransactionDTOPatchReq(
        Account account,
        Date date,
        StatusTypes status,
        TransactionTypes transactionType,
        double amount,
        String item,
        String icon,
        String shopName
) {

}
