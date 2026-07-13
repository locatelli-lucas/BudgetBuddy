package com.budgetbuddy.domain.transaction;

import com.budgetbuddy.domain.category.Category;
import com.budgetbuddy.domain.category.CategoryService;
import com.budgetbuddy.domain.category.dto.CategoryResponse;
import com.budgetbuddy.domain.financialresource.FinancialResource;
import com.budgetbuddy.domain.financialresource.FinancialResourceRepository;
import com.budgetbuddy.domain.financialresource.FinancialResourceService;
import com.budgetbuddy.domain.financialresource.FinancialResourceType;
import com.budgetbuddy.domain.transaction.dto.TransactionFilter;
import com.budgetbuddy.domain.transaction.dto.TransactionRequest;
import com.budgetbuddy.domain.transaction.dto.TransactionResponse;
import com.budgetbuddy.domain.transaction.dto.TransactionSummaryResponse;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserService;
import com.budgetbuddy.shared.exception.EntityNotFoundException;
import com.budgetbuddy.shared.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserService userService;
    private final CategoryService categoryService;
    private final FinancialResourceRepository financialResourceRepository;
    private final FinancialResourceService financialResourceService;

    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> getTransactions(String email, TransactionFilter filter, int page, int size, String[] sort) {
        User user = userService.getUserByEmail(email);
        
        Sort.Direction direction = Sort.Direction.fromString(sort[1]);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort[0]));
        
        Specification<Transaction> spec = Specification.where(hasUserId(user.getId()));
        
        if (filter.getType() != null) {
            spec = spec.and(hasType(filter.getType()));
        }
        if (filter.getCategoryId() != null) {
            spec = spec.and(hasCategoryId(filter.getCategoryId()));
        }
        if (filter.getStartDate() != null) {
            spec = spec.and(isAfterOrEqual(filter.getStartDate()));
        }
        if (filter.getEndDate() != null) {
            spec = spec.and(isBeforeOrEqual(filter.getEndDate()));
        }
        if (filter.getSearch() != null && !filter.getSearch().trim().isEmpty()) {
            spec = spec.and(descriptionContains(filter.getSearch()));
        }
        
        Page<Transaction> transactionPage = transactionRepository.findAll(spec, pageable);
        Page<TransactionResponse> responsePage = transactionPage.map(this::mapToResponse);
        
        return PageResponse.of(responsePage);
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransaction(String email, UUID id) {
        User user = userService.getUserByEmail(email);
        Transaction transaction = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Transaction", id.toString()));
        return mapToResponse(transaction);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getRecentTransactions(String email) {
        User user = userService.getUserByEmail(email);
        return transactionRepository.findTop5ByUserIdOrderByDateDescCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = {"userSummary", "budgetStatus"}, allEntries = true)
    public TransactionResponse createTransaction(String email, TransactionRequest request) {
        User user = userService.getUserByEmail(email);
        Category category = categoryService.getCategoryEntity(request.getCategoryId(), user.getId());
        
        FinancialResource financialResource = null;
        if (request.getFinancialResourceId() != null) {
            financialResource = financialResourceRepository.findByIdAndUserId(request.getFinancialResourceId(), user.getId())
                    .orElseThrow(() -> new EntityNotFoundException("FinancialResource", request.getFinancialResourceId().toString()));
            
            updateBalance(financialResource, request.getAmount(), request.getType());
        }

        Transaction transaction = Transaction.builder()
                .user(user)
                .category(category)
                .type(request.getType())
                .amount(request.getAmount())
                .description(request.getDescription())
                .notes(request.getNotes())
                .financialResource(financialResource)
                .paymentMethod(request.getPaymentMethod())
                .date(request.getDate())
                .isRecurring(request.isRecurring())
                .recurrenceRule(request.getRecurrenceRule())
                .build();
                
        transaction = transactionRepository.save(transaction);
        return mapToResponse(transaction);
    }

    private void updateBalance(FinancialResource fr, BigDecimal amount, Transaction.TransactionType type) {
        if (fr.getType() == FinancialResourceType.CREDIT_CARD) return;

        BigDecimal current = fr.getCurrentBalance() != null ? fr.getCurrentBalance() : BigDecimal.ZERO;
        if (type == Transaction.TransactionType.INCOME) {
            fr.setCurrentBalance(current.add(amount));
        } else {
            fr.setCurrentBalance(current.subtract(amount));
        }
        financialResourceRepository.save(fr);
    }

    @Transactional
    @CacheEvict(value = {"userSummary", "budgetStatus"}, allEntries = true)
    public TransactionResponse updateTransaction(String email, UUID id, TransactionRequest request) {
        User user = userService.getUserByEmail(email);
        Transaction transaction = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Transaction", id.toString()));
                
        Category category = categoryService.getCategoryEntity(request.getCategoryId(), user.getId());
        
        // Reverse old balance update if needed
        if (transaction.getFinancialResource() != null) {
            reverseBalance(transaction.getFinancialResource(), transaction.getAmount(), transaction.getType());
        }

        FinancialResource financialResource = null;
        if (request.getFinancialResourceId() != null) {
            financialResource = financialResourceRepository.findByIdAndUserId(request.getFinancialResourceId(), user.getId())
                    .orElseThrow(() -> new EntityNotFoundException("FinancialResource", request.getFinancialResourceId().toString()));
            updateBalance(financialResource, request.getAmount(), request.getType());
        }

        transaction.setCategory(category);
        transaction.setType(request.getType());
        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription());
        transaction.setNotes(request.getNotes());
        transaction.setFinancialResource(financialResource);
        transaction.setPaymentMethod(request.getPaymentMethod());
        transaction.setDate(request.getDate());
        transaction.setRecurring(request.isRecurring());
        transaction.setRecurrenceRule(request.getRecurrenceRule());
        
        transaction = transactionRepository.save(transaction);
        return mapToResponse(transaction);
    }

    private void reverseBalance(FinancialResource fr, BigDecimal amount, Transaction.TransactionType type) {
        if (fr.getType() == FinancialResourceType.CREDIT_CARD) return;

        BigDecimal current = fr.getCurrentBalance() != null ? fr.getCurrentBalance() : BigDecimal.ZERO;
        if (type == Transaction.TransactionType.INCOME) {
            fr.setCurrentBalance(current.subtract(amount));
        } else {
            fr.setCurrentBalance(current.add(amount));
        }
        financialResourceRepository.save(fr);
    }

    @Transactional
    @CacheEvict(value = {"userSummary", "budgetStatus"}, allEntries = true)
    public void deleteTransaction(String email, UUID id) {
        User user = userService.getUserByEmail(email);
        Transaction transaction = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Transaction", id.toString()));
        
        if (transaction.getFinancialResource() != null) {
            reverseBalance(transaction.getFinancialResource(), transaction.getAmount(), transaction.getType());
        }
        
        transactionRepository.delete(transaction);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "userSummary", key = "#email")
    public TransactionSummaryResponse getMonthlySummary(String email, int month, int year) {
        User user = userService.getUserByEmail(email);
        
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        BigDecimal totalIncome = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                user.getId(), Transaction.TransactionType.INCOME, startDate, endDate);
                
        BigDecimal totalExpense = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                user.getId(), Transaction.TransactionType.EXPENSE, startDate, endDate);
                
        BigDecimal netBalance = totalIncome.subtract(totalExpense);
        
        BigDecimal savingsRate = BigDecimal.ZERO;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = netBalance.divide(totalIncome, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
        }
        
        return TransactionSummaryResponse.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netBalance(netBalance)
                .savingsRate(savingsRate)
                .build();
    }

    private TransactionResponse mapToResponse(Transaction transaction) {
        Category category = transaction.getCategory();
        CategoryResponse categoryResponse = CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .icon(category.getIcon())
                .color(category.getColor())
                .type(category.getType())
                .isDefault(category.isDefault())
                .build();
                
        return TransactionResponse.builder()
                .id(transaction.getId())
                .category(categoryResponse)
                .type(transaction.getType())
                .amount(transaction.getAmount())
                .description(transaction.getDescription())
                .notes(transaction.getNotes())
                .financialResource(transaction.getFinancialResource() != null ? financialResourceService.mapToResponse(transaction.getFinancialResource()) : null)
                .paymentMethod(transaction.getPaymentMethod())
                .date(transaction.getDate())
                .isRecurring(transaction.isRecurring())
                .recurrenceRule(transaction.getRecurrenceRule())
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    // --- Specifications for filtering ---
    
    private Specification<Transaction> hasUserId(UUID userId) {
        return (root, query, cb) -> cb.equal(root.get("user").get("id"), userId);
    }
    
    private Specification<Transaction> hasType(Transaction.TransactionType type) {
        return (root, query, cb) -> cb.equal(root.get("type"), type);
    }
    
    private Specification<Transaction> hasCategoryId(UUID categoryId) {
        return (root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId);
    }
    
    private Specification<Transaction> isAfterOrEqual(LocalDate date) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("date"), date);
    }
    
    private Specification<Transaction> isBeforeOrEqual(LocalDate date) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("date"), date);
    }
    
    private Specification<Transaction> descriptionContains(String search) {
        return (root, query, cb) -> cb.like(cb.lower(root.get("description")), "%" + search.toLowerCase() + "%");
    }
}
