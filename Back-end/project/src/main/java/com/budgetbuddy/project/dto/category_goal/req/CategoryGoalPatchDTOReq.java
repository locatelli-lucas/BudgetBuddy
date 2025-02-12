package com.budgetbuddy.project.dto.category_goal.req;

import com.budgetbuddy.project.entities.Category;
import com.budgetbuddy.project.entities.CategoryGoal;
import com.budgetbuddy.project.entities.Goal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CategoryGoalPatchDTOReq(
        Goal goal,
        Category category,
        double amount
) {

}
