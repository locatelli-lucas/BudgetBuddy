package com.budgetbuddy.project.services;

import com.budgetbuddy.project.dto.goal.req.GoalDTOReq;
import com.budgetbuddy.project.dto.goal.res.GoalDTORes;
import com.budgetbuddy.project.entities.Goal;
import com.budgetbuddy.project.entities.User;
import com.budgetbuddy.project.exceptions.BadRequestException;
import com.budgetbuddy.project.repositories.GoalRepository;
import com.budgetbuddy.project.repositories.UserRepository;
import com.budgetbuddy.project.types.CategoryTypes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository;

    public GoalDTORes create(GoalDTOReq body, CategoryTypes type) {
        if(body == null) throw new BadRequestException("Goal is required");
        if(type == null) throw new BadRequestException("Type is required");

        Goal goal = this.goalRepository.save(body.dtoToGoal());
        Optional<User> optionalUser = this.userRepository.findById(body.user().getId());

        if(optionalUser.isEmpty()) throw new BadRequestException("User not found");
        User user = optionalUser.get();

        if(type == CategoryTypes.SAVING)
            user.setSavingGoals(goal);
        else
            user.setExpenseGoals(goal);

        return GoalDTORes.goalToDto(goal);
    }

    public Page<GoalDTORes> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return this.goalRepository.findAll(pageable).map(GoalDTORes::goalToDto);
    }

    public GoalDTORes findById(Long id) {
        if(id == null) throw new BadRequestException("Id is required");

        Goal goal = findByIdEntity(id);

        return GoalDTORes.goalToDto(goal);
    }

    public Goal findByIdEntity(Long id) {
        if(id == null) throw new BadRequestException("Id is required");

        Optional<Goal> goal = this.goalRepository.findById(id);

        if(goal.isEmpty()) throw new BadRequestException("Goal not found");

        return goal.get();
    }

    public GoalDTORes update(Long id, GoalDTOReq body) {
        if(id == null) throw new BadRequestException("Id is required");
        if(body == null) throw new BadRequestException("Goal is required");

        Goal goal = findByIdEntity(id);

        if(!Objects.equals(goal.getMonth(), body.month())) goal.setMonth(body.month());
        if(!Objects.equals(goal.getTargetAchieved(), body.targetAchieved())) goal.setTargetAchieved(body.targetAchieved());
        if(!Objects.equals(goal.getThisMonthTarget(), body.thisMonthTarget())) goal.setThisMonthTarget(body.thisMonthTarget());

        this.goalRepository.save(goal);

        return GoalDTORes.goalToDto(goal);
    }

    public GoalDTORes put(Long id, GoalDTOReq body) {
        if(id == null) throw new BadRequestException("Id is required");
        if(body == null) throw new BadRequestException("Goal is required");

        Goal goal = this.goalRepository.save(body.dtoToGoal());

        return GoalDTORes.goalToDto(goal);
    }

    public void deleteById(Long id) {
        if(id == null) throw new BadRequestException("Id is required");
        if(findByIdEntity(id) == null) throw new BadRequestException("Goal not found");

        this.goalRepository.deleteById(id);
    }

    public void deleteAll() {
        this.goalRepository.deleteAll();
    }
}
