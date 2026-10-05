package com.budgetbuddy.domain.goal;

import com.budgetbuddy.domain.goal.dto.GoalRequest;
import com.budgetbuddy.domain.goal.dto.GoalResponse;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserService;
import com.budgetbuddy.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<GoalResponse> getGoals(String email) {
        User user = userService.getUserByEmail(email);
        return goalRepository.findAllByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public GoalResponse createGoal(String email, GoalRequest request) {
        User user = userService.getUserByEmail(email);
        Goal goal = Goal.builder()
                .user(user)
                .name(request.getName())
                .targetAmount(request.getTargetAmount())
                .currentAmount(request.getCurrentAmount() != null ? request.getCurrentAmount() : BigDecimal.ZERO)
                .deadline(request.getDeadline())
                .color(request.getColor())
                .icon(request.getIcon())
                .isCompleted(false)
                .build();
        
        checkCompletion(goal);
        goal = goalRepository.save(goal);
        return mapToResponse(goal);
    }

    @Transactional
    public GoalResponse updateGoal(String email, UUID id, GoalRequest request) {
        User user = userService.getUserByEmail(email);
        Goal goal = goalRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Goal", id.toString()));
        
        goal.setName(request.getName());
        goal.setTargetAmount(request.getTargetAmount());
        if (request.getCurrentAmount() != null) {
            goal.setCurrentAmount(request.getCurrentAmount());
        }
        goal.setDeadline(request.getDeadline());
        goal.setColor(request.getColor());
        goal.setIcon(request.getIcon());
        
        checkCompletion(goal);
        goal = goalRepository.save(goal);
        return mapToResponse(goal);
    }

    @Transactional
    public void deleteGoal(String email, UUID id) {
        User user = userService.getUserByEmail(email);
        Goal goal = goalRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Goal", id.toString()));
        goalRepository.delete(goal);
    }

    private void checkCompletion(Goal goal) {
        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setCompleted(true);
        } else {
            goal.setCompleted(false);
        }
    }

    private GoalResponse mapToResponse(Goal goal) {
        BigDecimal progress = BigDecimal.ZERO;
        if (goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            progress = goal.getCurrentAmount()
                    .multiply(new BigDecimal("100"))
                    .divide(goal.getTargetAmount(), 2, RoundingMode.HALF_UP);
        }

        return GoalResponse.builder()
                .id(goal.getId())
                .name(goal.getName())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .progressPercent(progress)
                .deadline(goal.getDeadline())
                .color(goal.getColor())
                .icon(goal.getIcon())
                .isCompleted(goal.isCompleted())
                .build();
    }
}
