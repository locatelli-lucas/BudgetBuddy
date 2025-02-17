package com.budgetbuddy.project.controllers;

import com.budgetbuddy.project.dto.expense_category.req.ExpenseCategoryDTOPatchReq;
import com.budgetbuddy.project.dto.expense_category.req.ExpenseCategoryDTOReq;
import com.budgetbuddy.project.dto.expense_category.res.ExpenseCategoryDTORes;
import com.budgetbuddy.project.services.ExpenseCategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/expense-categories")
public class ExpenseCategoryController {

    @Autowired
    private ExpenseCategoryService expenseCategoryService;

    @PostMapping
    private ResponseEntity<ExpenseCategoryDTORes> create(@RequestBody @Valid ExpenseCategoryDTOReq body, UriComponentsBuilder uriBuilder) {
        ExpenseCategoryDTORes expenseCategory = this.expenseCategoryService.create(body);
        URI uri = uriBuilder.path("/expense-categories/{id}").buildAndExpand(expenseCategory.id()).toUri();
        return ResponseEntity.created(uri).body(expenseCategory);
    }

    @GetMapping
    private ResponseEntity<Page<ExpenseCategoryDTORes>> findAll(@RequestParam int page, @RequestParam int size) {
        Page<ExpenseCategoryDTORes> expenseCategories = this.expenseCategoryService.findAll(page, size);
        return ResponseEntity.ok(expenseCategories);
    }

    @GetMapping("/{id}")
    private ResponseEntity<ExpenseCategoryDTORes> findById(@PathVariable Long id) {
        ExpenseCategoryDTORes expenseCategory = this.expenseCategoryService.findById(id);
        return ResponseEntity.ok(expenseCategory);
    }

    @PatchMapping("/{id}")
    private ResponseEntity<ExpenseCategoryDTORes> update(@PathVariable Long id, @RequestBody @Valid ExpenseCategoryDTOPatchReq body) {
        ExpenseCategoryDTORes expenseCategory = this.expenseCategoryService.update(id, body);
        return ResponseEntity.ok(expenseCategory);
    }

    @PutMapping("/{id}")
    private ResponseEntity<ExpenseCategoryDTORes> put(@PathVariable Long id, @RequestBody @Valid ExpenseCategoryDTOReq body) {
        ExpenseCategoryDTORes expenseCategory = this.expenseCategoryService.put(id, body);
        return ResponseEntity.ok(expenseCategory);
    }

    @DeleteMapping("/{id}")
    private ResponseEntity<Void> delete(@PathVariable Long id) {
        this.expenseCategoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
