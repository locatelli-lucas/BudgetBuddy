package com.budgetbuddy.project.controllers;

import com.budgetbuddy.project.dto.category.req.CategoryDTOReq;
import com.budgetbuddy.project.dto.category.res.CategoryDTORes;
import com.budgetbuddy.project.services.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/category")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @PostMapping
    private ResponseEntity<CategoryDTORes> create(UriComponentsBuilder uriBuilder, @Valid CategoryDTOReq body) {
        CategoryDTORes category = this.categoryService.create(body);
        URI uri = uriBuilder.path("/category/{id}").build(category.id());
        return ResponseEntity.created(uri).body(category);
    }

    @GetMapping
    private ResponseEntity<Page<CategoryDTORes>> findAll(@RequestParam int page, @RequestParam int size) {
        Page<CategoryDTORes> categories = this.categoryService.findAll(page, size);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    private ResponseEntity<CategoryDTORes> findById(@PathVariable Long id) {
        CategoryDTORes category = this.categoryService.findById(id);
        return ResponseEntity.ok(category);
    }

    @PatchMapping("/{id}")
    private ResponseEntity<CategoryDTORes> update(@PathVariable Long id, @Valid CategoryDTOReq body) {
        CategoryDTORes category = this.categoryService.update(id, body);
        return ResponseEntity.ok(category);
    }

    @PutMapping("/{id}")
    private ResponseEntity<CategoryDTORes> put(@PathVariable Long id, @Valid CategoryDTOReq body) {
        CategoryDTORes category = this.categoryService.put(id, body);
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/{id}")
    private ResponseEntity<CategoryDTORes> deleteById(@PathVariable Long id) {
        this.categoryService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
