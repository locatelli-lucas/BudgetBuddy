package com.budgetbuddy.project.repositories;

import com.budgetbuddy.project.entities.CategoryGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryGoalRepository extends JpaRepository<CategoryGoal, Long> {

}
