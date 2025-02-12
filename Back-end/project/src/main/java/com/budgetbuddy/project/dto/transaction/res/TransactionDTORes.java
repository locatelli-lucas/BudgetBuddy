package com.budgetbuddy.project.dto.transaction.res;

import com.budgetbuddy.project.entities.Transaction;
import com.budgetbuddy.project.types.StatusTypes;
import com.budgetbuddy.project.types.TransactionTypes;

import java.util.Date;

public record TransactionDTORes(
        Long id,
        Long accountId,
        Date date,
        StatusTypes status,
        TransactionTypes transactionType,
        String receipt,
        double amount,
        String item,
        String icon,
        String shopName
) {
    public static TransactionDTORes transactionToDto(Transaction transaction) {
        return new TransactionDTORes(
                transaction.getId(),
                transaction.getAccount().getId(),
                transaction.getDate(),
                transaction.getStatus(),
                transaction.getTransactionType(),
                transaction.getReceipt(),
                transaction.getAmount(),
                transaction.getItem(),
                transaction.getIcon(),
                transaction.getShopName()
        );
    }
}
