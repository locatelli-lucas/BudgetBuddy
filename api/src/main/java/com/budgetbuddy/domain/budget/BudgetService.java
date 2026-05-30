package com.budgetbuddy.domain.budget;

import com.budgetbuddy.domain.budget.Budget.BudgetStatus;
import com.budgetbuddy.domain.budget.dto.BudgetRequest;
import com.budgetbuddy.domain.budget.dto.BudgetResponse;
import com.budgetbuddy.domain.budget.dto.BudgetStatusResponse;
import com.budgetbuddy.domain.budget.dto.ForecastResponse;
import com.budgetbuddy.domain.category.Category;
import com.budgetbuddy.domain.category.CategoryService;
import com.budgetbuddy.domain.category.dto.CategoryResponse;
import com.budgetbuddy.domain.transaction.Transaction;
import com.budgetbuddy.domain.transaction.TransactionRepository;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserService;
import com.budgetbuddy.shared.exception.BusinessException;
import com.budgetbuddy.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final UserService userService;
    private final CategoryService categoryService;

    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgets(String email, int month, int year) {
        User user = userService.getUserByEmail(email);
        return budgetRepository.findByUserIdAndMonthAndYear(user.getId(), month, year)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "budgetStatus", key = "#email + '-' + #request.month + '-' + #request.year")
    public BudgetResponse createBudget(String email, BudgetRequest request) {
        User user = userService.getUserByEmail(email);
        
        if (budgetRepository.existsByUserIdAndCategoryIdAndMonthAndYear(
                user.getId(), request.getCategoryId(), request.getMonth(), request.getYear())) {
            throw new BusinessException("Budget already exists for this category in the specified month and year");
        }
        
        Category category = categoryService.getCategoryEntity(request.getCategoryId(), user.getId());
        
        Budget budget = Budget.builder()
                .user(user)
                .category(category)
                .month(request.getMonth())
                .year(request.getYear())
                .limitAmount(request.getLimitAmount())
                .build();
                
        budget = budgetRepository.save(budget);
        return mapToResponse(budget);
    }

    @Transactional
    @CacheEvict(value = "budgetStatus", allEntries = true) // simplified eviction
    public BudgetResponse updateBudget(String email, UUID id, BudgetRequest request) {
        User user = userService.getUserByEmail(email);
        Budget budget = budgetRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Budget", id.toString()));
                
        // Only allow changing limit, not category or date
        budget.setLimitAmount(request.getLimitAmount());
        
        budget = budgetRepository.save(budget);
        return mapToResponse(budget);
    }

    @Transactional
    @CacheEvict(value = "budgetStatus", allEntries = true)
    public void deleteBudget(String email, UUID id) {
        User user = userService.getUserByEmail(email);
        Budget budget = budgetRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Budget", id.toString()));
        budgetRepository.delete(budget);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "budgetStatus", key = "#email + '-' + #month + '-' + #year")
    public List<BudgetStatusResponse> getBudgetStatus(String email, int month, int year) {
        User user = userService.getUserByEmail(email);
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(user.getId(), month, year);
        
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        return budgets.stream().map(budget -> {
            // Find total spent for this category in the given month
            // We need a specific query for this or use JPA specification
            // For now, doing a simpler query - in a real scenario we'd add this to the repository
            BigDecimal spent = calculateSpentForCategory(user.getId(), budget.getCategory().getId(), startDate, endDate);
            
            BigDecimal remaining = budget.getLimitAmount().subtract(spent);
            BigDecimal percentUsed = BigDecimal.ZERO;
            
            if (budget.getLimitAmount().compareTo(BigDecimal.ZERO) > 0) {
                percentUsed = spent.divide(budget.getLimitAmount(), 4, RoundingMode.HALF_UP)
                                   .multiply(new BigDecimal("100"));
            }
            
            BudgetStatus status = BudgetStatus.ON_TRACK;
            if (percentUsed.compareTo(new BigDecimal("100")) >= 0) {
                status = BudgetStatus.EXCEEDED;
            } else if (percentUsed.compareTo(new BigDecimal("80")) >= 0) {
                status = BudgetStatus.WARNING;
            }
            
            return BudgetStatusResponse.builder()
                    .id(budget.getId())
                    .categoryId(budget.getCategory().getId())
                    .categoryName(budget.getCategory().getName())
                    .categoryIcon(budget.getCategory().getIcon())
                    .categoryColor(budget.getCategory().getColor())
                    .limit(budget.getLimitAmount())
                    .spent(spent)
                    .remaining(remaining)
                    .percentUsed(percentUsed)
                    .status(status)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ForecastResponse getForecast(String email, int month, int year) {
        User user = userService.getUserByEmail(email);
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(user.getId(), month, year);
        
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        LocalDate today = LocalDate.now();
        
        int totalDaysInMonth = startDate.lengthOfMonth();
        int daysPassed = Math.min(today.getDayOfMonth(), totalDaysInMonth);
        
        // If requesting a future month, or if no days passed, return zeros
        if (startDate.isAfter(today) || daysPassed == 0) {
            return ForecastResponse.builder()
                    .currentTotalSpent(BigDecimal.ZERO)
                    .currentTotalLimit(getTotalLimit(budgets))
                    .projectedTotalSpent(BigDecimal.ZERO)
                    .averageDailySpend(BigDecimal.ZERO)
                    .safeDailySpend(BigDecimal.ZERO)
                    .isTrendingToExceed(false)
                    .build();
        }
        
        // If requesting a past month, calculate final values
        if (endDate.isBefore(today)) {
            daysPassed = totalDaysInMonth;
        }

        BigDecimal totalLimit = getTotalLimit(budgets);
        BigDecimal currentTotalSpent = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                user.getId(), Transaction.TransactionType.EXPENSE, startDate, endDate);
                
        BigDecimal averageDailySpend = currentTotalSpent.divide(new BigDecimal(daysPassed), 2, RoundingMode.HALF_UP);
        BigDecimal projectedTotalSpent = averageDailySpend.multiply(new BigDecimal(totalDaysInMonth));
        
        int remainingDays = totalDaysInMonth - daysPassed;
        BigDecimal safeDailySpend = BigDecimal.ZERO;
        
        if (remainingDays > 0) {
            BigDecimal remainingLimit = totalLimit.subtract(currentTotalSpent);
            if (remainingLimit.compareTo(BigDecimal.ZERO) > 0) {
                safeDailySpend = remainingLimit.divide(new BigDecimal(remainingDays), 2, RoundingMode.HALF_DOWN);
            }
        }
        
        boolean trendingToExceed = totalLimit.compareTo(BigDecimal.ZERO) > 0 && 
                                   projectedTotalSpent.compareTo(totalLimit) > 0;
                                   
        return ForecastResponse.builder()
                .currentTotalSpent(currentTotalSpent)
                .currentTotalLimit(totalLimit)
                .projectedTotalSpent(projectedTotalSpent)
                .averageDailySpend(averageDailySpend)
                .safeDailySpend(safeDailySpend)
                .isTrendingToExceed(trendingToExceed)
                .build();
    }
    
    private BigDecimal calculateSpentForCategory(UUID userId, UUID categoryId, LocalDate startDate, LocalDate endDate) {
        // Ideally we'd have a specific repository method for this:
        // return transactionRepository.sumAmountByUserIdAndCategoryIdAndTypeAndDateBetween(...)
        
        // As a fallback for Phase 1 part 2:
        return transactionRepository.findAll().stream()
                .filter(t -> t.getUser().getId().equals(userId) && 
                             t.getCategory().getId().equals(categoryId) &&
                             t.getType() == Transaction.TransactionType.EXPENSE &&
                             !t.getDate().isBefore(startDate) && 
                             !t.getDate().isAfter(endDate))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    private BigDecimal getTotalLimit(List<Budget> budgets) {
        return budgets.stream()
                .map(Budget::getLimitAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BudgetResponse mapToResponse(Budget budget) {
        CategoryResponse categoryResponse = CategoryResponse.builder()
                .id(budget.getCategory().getId())
                .name(budget.getCategory().getName())
                .icon(budget.getCategory().getIcon())
                .color(budget.getCategory().getColor())
                .type(budget.getCategory().getType())
                .isDefault(budget.getCategory().isDefault())
                .build();
                
        return BudgetResponse.builder()
                .id(budget.getId())
                .category(categoryResponse)
                .month(budget.getMonth())
                .year(budget.getYear())
                .limitAmount(budget.getLimitAmount())
                .build();
    }
}
