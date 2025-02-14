package com.budgetbuddy.project.dto.bill.res;

import com.budgetbuddy.project.entities.Bill;

import java.util.Date;

public record BillDTORes(
        Long id,
        Long userId,
        Date dueDate,
        String icon,
        String billName,
        String description,
        Date lastChargeDate,
        double amount
) {
    public static BillDTORes billToDto(Bill bill) {
        return new BillDTORes(
                bill.getId(),
                bill.getUser().getId(),
                bill.getDueDate(),
                bill.getIcon(),
                bill.getBillName(),
                bill.getDescription(),
                bill.getLastChargeDate(),
                bill.getAmount()
        );
    }
}
