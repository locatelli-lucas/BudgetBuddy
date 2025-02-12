package com.budgetbuddy.project.services;

import com.budgetbuddy.project.dto.category.req.CategoryDTOReq;
import com.budgetbuddy.project.dto.category.res.CategoryDTORes;
import com.budgetbuddy.project.entities.Category;
import com.budgetbuddy.project.exceptions.BadRequestException;
import com.budgetbuddy.project.repositories.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public CategoryDTORes create(CategoryDTOReq body) {
        if(body == null) throw new BadRequestException("Request body is required");

        Category category = this.categoryRepository.save(body.dtoToCategory());
        return CategoryDTORes.categoryToDTO(category);
    }

    public Page<CategoryDTORes> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return this.categoryRepository.findAll(pageable).map(CategoryDTORes::categoryToDTO);
    }


    public CategoryDTORes findById(Long id) {
        if(id == null) throw new BadRequestException("Id is required");

        Category category = findByIdEntity(id);
        return CategoryDTORes.categoryToDTO(category);
    }

    private Category findByIdEntity(Long id) {
        Optional<Category> category = this.categoryRepository.findById(id);

        if(category.isEmpty()) throw new BadRequestException("Category not found");

        return category.get();
    }

    public CategoryDTORes update(Long id, CategoryDTOReq body) {
        if(id == null) throw new BadRequestException("Id is required");
        if(body == null) throw new BadRequestException("Request body is required");

        Category category = findByIdEntity(id);

        if(!Objects.equals(category.getName(), body.name())) category.setName(body.name());

        this.categoryRepository.save(category);
        return CategoryDTORes.categoryToDTO(category);
    }

    public CategoryDTORes put(Long id, CategoryDTOReq body) {
        if(id == null) throw new BadRequestException("Id is required");
        if(body == null) throw new BadRequestException("Request body is required");

        Category category = this.categoryRepository.save(body.dtoToCategory(id));

        return CategoryDTORes.categoryToDTO(category);
    }

    public void deleteById(Long id) {
        if(id == null) throw new BadRequestException("Id is required");
        if(findById(id) == null) throw new BadRequestException("Category not found");

        this.categoryRepository.deleteById(id);

    }
}
