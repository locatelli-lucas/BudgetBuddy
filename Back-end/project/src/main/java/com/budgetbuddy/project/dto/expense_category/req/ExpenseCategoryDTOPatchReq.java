package com.budgetbuddy.project.dto.expense_category.req;

import com.budgetbuddy.project.entities.Category;

public record ExpenseCategoryDTOPatchReq(
        Category category
) {
}
