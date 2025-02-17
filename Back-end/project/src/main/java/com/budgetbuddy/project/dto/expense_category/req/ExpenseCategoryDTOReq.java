package com.budgetbuddy.project.dto.expense_category.req;

import com.budgetbuddy.project.entities.Category;
import com.budgetbuddy.project.entities.ExpenseCategory;
import com.budgetbuddy.project.entities.User;
import jakarta.validation.constraints.NotNull;

public record ExpenseCategoryDTOReq(
       @NotNull(message = "User is reequired")
       User user,

       @NotNull(message = "Category is required")
       Category category
) {
    public ExpenseCategory dtoToCategoryExpense() {
        return new ExpenseCategory(user, category);
    }

    public ExpenseCategory dtoToCategoryExpense(Long id) {
        return new ExpenseCategory(id, user, category);
    }
}
