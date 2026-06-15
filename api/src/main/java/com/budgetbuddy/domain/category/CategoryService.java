package com.budgetbuddy.domain.category;

import com.budgetbuddy.domain.category.dto.CategoryRequest;
import com.budgetbuddy.domain.category.dto.CategoryResponse;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserService;
import com.budgetbuddy.shared.exception.BusinessException;
import com.budgetbuddy.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories(String email) {
        User user = userService.getUserByEmail(email);
        List<Category> categories = categoryRepository.findByUserIdOrIsDefaultTrue(user.getId());
        return categories.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Category getCategoryEntity(UUID categoryId, UUID userId) {
        return categoryRepository.findByIdAndUserIdOrIsDefaultTrue(categoryId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Category", categoryId.toString()));
    }

    @Transactional(readOnly = true)
    public List<Category> getAllCategoryEntities(UUID userId) {
        return categoryRepository.findByUserIdOrIsDefaultTrue(userId);
    }

    @Transactional
    public CategoryResponse createCategory(String email, CategoryRequest request) {
        User user = userService.getUserByEmail(email);
        
        Category category = Category.builder()
                .user(user)
                .name(request.getName())
                .icon(request.getIcon())
                .color(request.getColor())
                .type(request.getType())
                .isDefault(false)
                .build();
                
        category = categoryRepository.save(category);
        return mapToResponse(category);
    }

    @Transactional
    public CategoryResponse updateCategory(String email, UUID categoryId, CategoryRequest request) {
        User user = userService.getUserByEmail(email);
        
        Category category = categoryRepository.findByIdAndUserId(categoryId, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Category", categoryId.toString()));
                
        if (category.isDefault()) {
            throw new BusinessException("Cannot modify system default categories");
        }
        
        category.setName(request.getName());
        category.setIcon(request.getIcon());
        category.setColor(request.getColor());
        category.setType(request.getType());
        
        category = categoryRepository.save(category);
        return mapToResponse(category);
    }

    @Transactional
    public void deleteCategory(String email, UUID categoryId) {
        User user = userService.getUserByEmail(email);
        
        Category category = categoryRepository.findByIdAndUserId(categoryId, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Category", categoryId.toString()));
                
        if (category.isDefault()) {
            throw new BusinessException("Cannot delete system default categories");
        }
        
        // TODO: In Phase 1 part 2, check if category is used in transactions before deleting
        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .icon(category.getIcon())
                .color(category.getColor())
                .type(category.getType())
                .isDefault(category.isDefault())
                .build();
    }
}
