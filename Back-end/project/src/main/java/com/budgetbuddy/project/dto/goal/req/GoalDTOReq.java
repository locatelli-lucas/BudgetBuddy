package com.budgetbuddy.project.dto.goal.req;

import com.budgetbuddy.project.entities.Goal;
import com.budgetbuddy.project.entities.User;
import com.budgetbuddy.project.types.CategoryTypes;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Date;

public record GoalDTOReq(
        @NotNull
        Date month,

        @NotNull
        double targetAchieved,

        @NotNull
        double thisMonthTarget,

        @NotNull
        User user
) {
    public Goal dtoToGoal() {
        return new Goal(this.month, this.targetAchieved, this.thisMonthTarget, this.user);
    }

    public Goal dtoToGoal(Long id) {
        return new Goal(id, this.month, this.targetAchieved, this.thisMonthTarget, this.user);
    }
}
