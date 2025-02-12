package com.budgetbuddy.project.controllers;

import com.budgetbuddy.project.dto.category_goal.req.CategoryGoalDTOReq;
import com.budgetbuddy.project.dto.category_goal.req.CategoryGoalPatchDTOReq;
import com.budgetbuddy.project.dto.category_goal.res.CategoryGoalDTORes;
import com.budgetbuddy.project.services.CategoryGoalService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/category-goals")
public class CategoryGoalController {

    @Autowired
    private CategoryGoalService categoryGoalService;

    @PostMapping
    private ResponseEntity<CategoryGoalDTORes> create(@RequestBody @Valid CategoryGoalDTOReq body, UriComponentsBuilder uriBuilder) {
        CategoryGoalDTORes categoryGoal = this.categoryGoalService.create(body);
        URI uri = uriBuilder.path("/category-goals/{id}").buildAndExpand(categoryGoal.id()).toUri();
        return ResponseEntity.created(uri).body(categoryGoal);
    }

    @GetMapping
    private ResponseEntity<Page<CategoryGoalDTORes>> findAll(@RequestParam int page, @RequestParam int size) {
        Page<CategoryGoalDTORes> categoryGoals = this.categoryGoalService.findAll(page, size);
        return ResponseEntity.ok(categoryGoals);
    }

    @GetMapping("/{id}")
    private ResponseEntity<CategoryGoalDTORes> findById(@PathVariable Long id) {
        CategoryGoalDTORes categoryGoal = this.categoryGoalService.findById(id);
        return ResponseEntity.ok(categoryGoal);
    }

    @PatchMapping("/{id}")
    private ResponseEntity<CategoryGoalDTORes> update(@PathVariable Long id, @RequestBody @Valid CategoryGoalPatchDTOReq body) {
        CategoryGoalDTORes categoryGoal = this.categoryGoalService.update(id, body);
        return ResponseEntity.ok(categoryGoal);
    }

    @PutMapping("/{id}")
    private ResponseEntity<CategoryGoalDTORes> put(@PathVariable Long id, @RequestBody @Valid CategoryGoalDTOReq body) {
        CategoryGoalDTORes categoryGoal = this.categoryGoalService.put(id, body);
        return ResponseEntity.ok(categoryGoal);
    }

    @DeleteMapping
    private ResponseEntity<Void> deleteAll() {
        this.categoryGoalService.deleteAll();
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    private ResponseEntity<Void> deleteById(@PathVariable Long id) {
        this.categoryGoalService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
