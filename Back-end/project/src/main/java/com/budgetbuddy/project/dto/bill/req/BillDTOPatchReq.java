package com.budgetbuddy.project.dto.bill.req;

import com.budgetbuddy.project.entities.Bill;
import com.budgetbuddy.project.entities.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Date;

public record BillDTOPatchReq(
        Date dueDate,
        String icon,
        String billName,
        String description,
        Date lastChargeDate,
        double amount
) {

}
