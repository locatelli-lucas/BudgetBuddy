package com.budgetbuddy.project.dto.category_goal.req;

import com.budgetbuddy.project.entities.Category;
import com.budgetbuddy.project.entities.CategoryGoal;
import com.budgetbuddy.project.entities.Goal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CategoryGoalDTOReq(
        @NotNull(message = "Goal is required")
        Goal goal,

        @NotNull(message = "Category is required")
        Category category,

        @NotNull(message = "Amount is required")
        @NotBlank(message = "Amount is required")
        double amount
) {
    public CategoryGoal dtoToGoalCategory() {
        return new CategoryGoal(
                this.goal(),
                this.category(),
                this.amount()
        );
    }

    public CategoryGoal dtoToGoalCategory(Long id) {
        return new CategoryGoal(
                id,
                this.goal(),
                this.category(),
                this.amount()
        );
    }
}
