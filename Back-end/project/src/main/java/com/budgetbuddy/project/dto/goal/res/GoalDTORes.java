package com.budgetbuddy.project.dto.goal.res;

import com.budgetbuddy.project.entities.Goal;

import java.util.Date;

public record GoalDTORes(
        Long id,
        Date month,
        double targetAchieved,
        double thisMonthTarget
) {
    public static GoalDTORes goalToDto(Goal goal) {
        return new GoalDTORes(
                goal.getId(),
                goal.getMonth(),
                goal.getTargetAchieved(),
                goal.getThisMonthTarget()
        );
    }
}
