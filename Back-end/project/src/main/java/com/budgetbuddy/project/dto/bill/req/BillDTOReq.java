package com.budgetbuddy.project.dto.bill.req;

import com.budgetbuddy.project.entities.Bill;
import com.budgetbuddy.project.entities.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Date;

public record BillDTOReq(
        @NotNull(message = "User is required")
        User user,

        @NotNull(message = "Due date is required")
        @NotBlank(message = "Due date is required")
        Date dueDate,

        String icon,

        @NotNull(message = "Bill name is required")
        @NotBlank(message = "Bill name is required")
        String billName,

        String description,

        @NotNull(message = "Last charge date is required")
        @NotBlank(message = "Last charge date is required")
        Date lastChargeDate,

        @NotNull(message = "Amount is required")
        double amount
) {
    public Bill dtoToBill() {
        return new Bill(
                this.user(),
                this.dueDate(),
                this.icon(),
                this.billName(),
                this.description(),
                this.lastChargeDate(),
                this.amount()
        );
    }

    public Bill dtoToBill(Long id) {
        return new Bill(
                id,
                this.user(),
                this.dueDate(),
                this.icon(),
                this.billName(),
                this.description(),
                this.lastChargeDate(),
                this.amount()
        );
    }

}
