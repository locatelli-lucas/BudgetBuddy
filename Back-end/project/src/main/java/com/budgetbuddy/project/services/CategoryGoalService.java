package com.budgetbuddy.project.services;

import com.budgetbuddy.project.dto.category_goal.req.CategoryGoalDTOReq;
import com.budgetbuddy.project.dto.category_goal.req.CategoryGoalPatchDTOReq;
import com.budgetbuddy.project.dto.category_goal.res.CategoryGoalDTORes;
import com.budgetbuddy.project.entities.CategoryGoal;
import com.budgetbuddy.project.exceptions.BadRequestException;
import com.budgetbuddy.project.exceptions.EntityNotFoundException;
import com.budgetbuddy.project.repositories.CategoryGoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
public class CategoryGoalService {

    @Autowired
    private CategoryGoalRepository categoryGoalRepository;

    public CategoryGoalDTORes create(CategoryGoalDTOReq body) {
        if(body == null) throw new IllegalArgumentException("Body cannot be null");

        CategoryGoal categoryGoal = this.categoryGoalRepository.save(body.dtoToGoalCategory());

        return CategoryGoalDTORes.CategoryGoalToDto(categoryGoal);
    }

    public Page<CategoryGoalDTORes> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return this.categoryGoalRepository.findAll(pageable).map(CategoryGoalDTORes::CategoryGoalToDto);
    }

    public CategoryGoal findByIdEntity(Long id) {
        if(id == null) throw new BadRequestException("Id cannot be null");

        Optional<CategoryGoal> categoryGoal = this.categoryGoalRepository.findById(id);

        if(categoryGoal.isEmpty()) throw new EntityNotFoundException("Category goal not found");

        return categoryGoal.get();
    }

    public CategoryGoalDTORes findById(Long id) {
        CategoryGoal categoryGoal = findByIdEntity(id);
        return CategoryGoalDTORes.CategoryGoalToDto(categoryGoal);
    }

    public CategoryGoalDTORes update(Long id, CategoryGoalPatchDTOReq body) {
        if(id == null) throw new BadRequestException("Id cannot be null");
        if(body == null) throw new BadRequestException("Body cannot be null");

        CategoryGoal categoryGoal = findByIdEntity(id);

        if(!Objects.equals(body.goal(), categoryGoal.getGoal())) categoryGoal.setGoal(body.goal());
        if(!Objects.equals(body.category(), categoryGoal.getCategory())) categoryGoal.setCategory(body.category());
        if(!Objects.equals(body.amount(), categoryGoal.getAmount())) categoryGoal.setAmount(body.amount());

        this.categoryGoalRepository.save(categoryGoal);
        return CategoryGoalDTORes.CategoryGoalToDto(categoryGoal);
    }

    public CategoryGoalDTORes put(Long id, CategoryGoalDTOReq body) {
        if(id == null) throw new BadRequestException("Id cannot be null");
        if(body == null) throw new BadRequestException("Body cannot be null");

        CategoryGoal categoryGoal = this.categoryGoalRepository.save(body.dtoToGoalCategory(id));
        return CategoryGoalDTORes.CategoryGoalToDto(categoryGoal);
    }

    public void deleteAll() {
        this.categoryGoalRepository.deleteAll();
    }

    public void deleteById(Long id) {
        if(id == null) throw new BadRequestException("Id cannot be null");
        if(findByIdEntity(id) == null) throw new EntityNotFoundException("Category goal not found");

        this.categoryGoalRepository.deleteById(id);
    }
}
