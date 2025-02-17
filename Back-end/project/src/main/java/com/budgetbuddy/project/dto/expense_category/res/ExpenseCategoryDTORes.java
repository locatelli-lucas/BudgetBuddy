package com.budgetbuddy.project.dto.expense_category.res;

import com.budgetbuddy.project.entities.Category;
import com.budgetbuddy.project.entities.ExpenseCategory;

public record ExpenseCategoryDTORes(
        Long id,
        Long userId,
        Category category
) {
    public static ExpenseCategoryDTORes expenseCategoryToDto(ExpenseCategory expenseCategory) {
        return new ExpenseCategoryDTORes(
                expenseCategory.getId(),
                expenseCategory.getUser().getId(),
                expenseCategory.getCategory()
        );
    }
}
