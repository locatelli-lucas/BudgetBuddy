package com.budgetbuddy.project.dto.category.req;

import com.budgetbuddy.project.entities.Category;
import com.budgetbuddy.project.types.CategoryTypes;

public record CategoryDTOReq(CategoryTypes type, String name, String icon) {
    public Category dtoToCategory() {
        return new Category(this.type, this.name, this.icon);
    }

    public Category dtoToCategory(Long id) {
        return new Category(
                id,
                this.type,
                this.name,
                this.icon
        );
    }
}
