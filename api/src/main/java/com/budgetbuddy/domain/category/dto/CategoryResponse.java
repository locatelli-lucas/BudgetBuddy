package com.budgetbuddy.domain.category.dto;

import com.budgetbuddy.domain.category.Category.CategoryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private UUID id;
    private String name;
    private String icon;
    private String color;
    private CategoryType type;
    private boolean isDefault;
}
