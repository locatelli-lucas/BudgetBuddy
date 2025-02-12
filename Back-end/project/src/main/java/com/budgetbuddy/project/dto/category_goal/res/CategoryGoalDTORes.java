package com.budgetbuddy.project.dto.category_goal.res;

import com.budgetbuddy.project.entities.CategoryGoal;

public record CategoryGoalDTORes(
        Long id,
        Long goalId,
        Long categoryId,
        double amount
) {
    public static CategoryGoalDTORes CategoryGoalToDto(CategoryGoal categoryGoal) {
        return new CategoryGoalDTORes(
                categoryGoal.getId(),
                categoryGoal.getGoal().getId(),
                categoryGoal.getCategory().getId(),
                categoryGoal.getAmount()
        );
    }
}
