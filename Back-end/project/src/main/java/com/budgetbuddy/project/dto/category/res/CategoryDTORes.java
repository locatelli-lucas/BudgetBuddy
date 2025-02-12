package com.budgetbuddy.project.dto.category.res;

import com.budgetbuddy.project.entities.Category;

public record CategoryDTORes(Long id, String name) {
    public static CategoryDTORes categoryToDTO(Category category) {
        return new CategoryDTORes(
                category.getId(),
                category.getName());
    }
}
