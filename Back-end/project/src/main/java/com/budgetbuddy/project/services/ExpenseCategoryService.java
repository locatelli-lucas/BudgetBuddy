package com.budgetbuddy.project.services;

import com.budgetbuddy.project.dto.expense_category.req.ExpenseCategoryDTOPatchReq;
import com.budgetbuddy.project.dto.expense_category.req.ExpenseCategoryDTOReq;
import com.budgetbuddy.project.dto.expense_category.res.ExpenseCategoryDTORes;
import com.budgetbuddy.project.entities.Expense;
import com.budgetbuddy.project.entities.ExpenseCategory;
import com.budgetbuddy.project.exceptions.BadRequestException;
import com.budgetbuddy.project.exceptions.EntityNotFoundException;
import com.budgetbuddy.project.repositories.ExpenseCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
public class ExpenseCategoryService {

    @Autowired
    private ExpenseCategoryRepository expenseCategoryRepository;

    public ExpenseCategoryDTORes create(ExpenseCategoryDTOReq body) {
        if(body == null) throw new BadRequestException("Body is required");

        ExpenseCategory expenseCategory = this.expenseCategoryRepository.save(body.dtoToCategoryExpense());
        return ExpenseCategoryDTORes.expenseCategoryToDto(expenseCategory);
    }

    public Page<ExpenseCategoryDTORes> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ExpenseCategory> expenseCategories = this.expenseCategoryRepository.findAll(pageable);
        return expenseCategories.map(ExpenseCategoryDTORes::expenseCategoryToDto);
    }

    public ExpenseCategory findByIdEntity(Long id) {
        if(id == null) throw new BadRequestException("Id is required");

        Optional<ExpenseCategory> optional = this.expenseCategoryRepository.findById(id);

        if(optional.isEmpty()) throw new EntityNotFoundException("Expense category not found");

        return optional.get();
    }

    public ExpenseCategoryDTORes findById(Long id) {
        if(id == null) throw new BadRequestException("Id is required");

        ExpenseCategory expenseCategory = this.findByIdEntity(id);
        return ExpenseCategoryDTORes.expenseCategoryToDto(expenseCategory);
    }

    public ExpenseCategoryDTORes update(Long id, ExpenseCategoryDTOPatchReq body) {
        if(id == null) throw new BadRequestException("Id is required");
        if(body == null) throw new BadRequestException("Body is required");

        ExpenseCategory expenseCategory = this.findByIdEntity(id);

        if(!Objects.equals(body.category(), expenseCategory.getExpenses())) expenseCategory.setCategory(body.category());

        this.expenseCategoryRepository.save(expenseCategory);
        return ExpenseCategoryDTORes.expenseCategoryToDto(expenseCategory);
    }

    public ExpenseCategoryDTORes put(Long id, ExpenseCategoryDTOReq body) {
        if(id == null) throw new BadRequestException("Id is required");
        if(body == null) throw new BadRequestException("Body is required");

        ExpenseCategory expenseCategory = this.expenseCategoryRepository.save(body.dtoToCategoryExpense(id));
        return ExpenseCategoryDTORes.expenseCategoryToDto(expenseCategory);
    }

    public void delete(Long id) {
        if(id == null) throw new BadRequestException("Id is required");
        if(this.findByIdEntity(id) == null) throw new EntityNotFoundException("Expense category not found");

        this.expenseCategoryRepository.deleteById(id);
    }
}
