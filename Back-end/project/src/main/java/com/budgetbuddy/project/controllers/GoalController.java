package com.budgetbuddy.project.controllers;

import com.budgetbuddy.project.dto.goal.req.GoalDTOReq;
import com.budgetbuddy.project.dto.goal.res.GoalDTORes;
import com.budgetbuddy.project.services.GoalService;
import com.budgetbuddy.project.types.CategoryTypes;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/goal")
public class GoalController {

    @Autowired
    private GoalService goalService;

    @PostMapping
    private ResponseEntity<GoalDTORes> create(@RequestBody @Valid GoalDTOReq body, UriComponentsBuilder uriBuilder, @RequestParam CategoryTypes type) {
        GoalDTORes goal = this.goalService.create(body, type);
        URI uri = uriBuilder.path("/goal/{id}").buildAndExpand(goal.id()).toUri();
        return ResponseEntity.created(uri).body(goal);
    }

    @GetMapping
    private ResponseEntity<Page<GoalDTORes>> findAll(@RequestParam int page, @RequestParam int size) {
        Page<GoalDTORes> goals = this.goalService.findAll(page, size);
        return ResponseEntity.ok(goals);
    }

    @GetMapping("/{id}")
    private ResponseEntity<GoalDTORes> findById(@PathVariable Long id) {
        GoalDTORes goal = this.goalService.findById(id);
        return ResponseEntity.ok(goal);
    }

    @PatchMapping("/{id}")
    private ResponseEntity<GoalDTORes> update(@PathVariable Long id, @RequestBody @Valid GoalDTOReq body) {
        GoalDTORes goal = this.goalService.update(id, body);
        return ResponseEntity.ok(goal);
    }

    @PutMapping("/{id}")
    private ResponseEntity<GoalDTORes> put(@PathVariable Long id, @RequestBody @Valid GoalDTOReq body) {
        GoalDTORes goal = this.goalService.put(id, body);
        return ResponseEntity.ok(goal);
    }

    @DeleteMapping("/{id}")
    private ResponseEntity<GoalDTORes> deleteById(@PathVariable Long id) {
        this.goalService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    private ResponseEntity<GoalDTORes> deleteAll() {
        this.goalService.deleteAll();
        return ResponseEntity.noContent().build();
    }

}
