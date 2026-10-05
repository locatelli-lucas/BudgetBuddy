package com.budgetbuddy.domain.transaction;

import com.budgetbuddy.domain.category.Category;
import com.budgetbuddy.domain.category.CategoryService;
import com.budgetbuddy.domain.financialresource.FinancialResource;
import com.budgetbuddy.domain.financialresource.FinancialResourceRepository;
import com.budgetbuddy.domain.financialresource.FinancialResourceService;
import com.budgetbuddy.domain.financialresource.FinancialResourceType;
import com.budgetbuddy.domain.transaction.dto.TransactionRequest;
import com.budgetbuddy.domain.transaction.dto.TransactionResponse;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private UserService userService;
    @Mock
    private CategoryService categoryService;
    @Mock
    private FinancialResourceRepository financialResourceRepository;
    @Mock
    private FinancialResourceService financialResourceService;

    @InjectMocks
    private TransactionService transactionService;

    private User user;
    private Category category;
    private FinancialResource bankAccount;

    @BeforeEach
    void setUp() {
        user = User.builder().id(UUID.randomUUID()).email("test@example.com").build();
        category = Category.builder().id(UUID.randomUUID()).name("Salário").build();
        bankAccount = FinancialResource.builder()
                .id(UUID.randomUUID())
                .name("Bradesco")
                .type(FinancialResourceType.CHECKING_ACCOUNT)
                .currentBalance(new BigDecimal("1000.00"))
                .build();
    }

    @Test
    @DisplayName("Should update balance when creating income transaction")
    void shouldUpdateBalanceOnIncome() {
        TransactionRequest request = TransactionRequest.builder()
                .categoryId(category.getId())
                .financialResourceId(bankAccount.getId())
                .amount(new BigDecimal("500.00"))
                .type(Transaction.TransactionType.INCOME)
                .description("Bonus")
                .date(LocalDate.now())
                .build();

        when(userService.getUserByEmail(anyString())).thenReturn(user);
        when(categoryService.getCategoryEntity(any(), any())).thenReturn(category);
        when(financialResourceRepository.findByIdAndUserId(any(), any())).thenReturn(Optional.of(bankAccount));
        when(transactionRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        transactionService.createTransaction(user.getEmail(), request);

        assertThat(bankAccount.getCurrentBalance()).isEqualByComparingTo("1500.00");
        verify(financialResourceRepository).save(bankAccount);
    }

    @Test
    @DisplayName("Should update balance when creating expense transaction")
    void shouldUpdateBalanceOnExpense() {
        TransactionRequest request = TransactionRequest.builder()
                .categoryId(category.getId())
                .financialResourceId(bankAccount.getId())
                .amount(new BigDecimal("200.00"))
                .type(Transaction.TransactionType.EXPENSE)
                .description("Supermarket")
                .date(LocalDate.now())
                .build();

        when(userService.getUserByEmail(anyString())).thenReturn(user);
        when(categoryService.getCategoryEntity(any(), any())).thenReturn(category);
        when(financialResourceRepository.findByIdAndUserId(any(), any())).thenReturn(Optional.of(bankAccount));
        when(transactionRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        transactionService.createTransaction(user.getEmail(), request);

        assertThat(bankAccount.getCurrentBalance()).isEqualByComparingTo("800.00");
        verify(financialResourceRepository).save(bankAccount);
    }

    @Test
    @DisplayName("Should reverse old balance and apply new one when updating transaction")
    void shouldReverseBalanceOnUpdate() {
        Transaction oldTransaction = Transaction.builder()
                .id(UUID.randomUUID())
                .user(user)
                .financialResource(bankAccount)
                .amount(new BigDecimal("100.00"))
                .type(Transaction.TransactionType.EXPENSE)
                .build();

        TransactionRequest updateRequest = TransactionRequest.builder()
                .categoryId(category.getId())
                .financialResourceId(bankAccount.getId())
                .amount(new BigDecimal("300.00"))
                .type(Transaction.TransactionType.EXPENSE)
                .description("Updated Expense")
                .date(LocalDate.now())
                .build();

        when(userService.getUserByEmail(anyString())).thenReturn(user);
        when(transactionRepository.findByIdAndUserId(any(), any())).thenReturn(Optional.of(oldTransaction));
        when(categoryService.getCategoryEntity(any(), any())).thenReturn(category);
        when(financialResourceRepository.findByIdAndUserId(any(), any())).thenReturn(Optional.of(bankAccount));
        when(transactionRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        // Starting balance: 1000.00
        // Old transaction: -100.00 (already reflected in 1000? No, let's assume currentBalance is 1000 and it includes the old tx)
        // Wait, the logic in Service:
        // 1. reverseBalance(old): if it was expense, add 100. -> 1100.00
        // 2. updateBalance(new): if it is expense, subtract 300. -> 800.00
        
        transactionService.updateTransaction(user.getEmail(), oldTransaction.getId(), updateRequest);

        assertThat(bankAccount.getCurrentBalance()).isEqualByComparingTo("800.00");
    }

    @Test
    @DisplayName("Should reverse balance when deleting transaction")
    void shouldReverseBalanceOnDelete() {
        Transaction transaction = Transaction.builder()
                .id(UUID.randomUUID())
                .user(user)
                .financialResource(bankAccount)
                .amount(new BigDecimal("150.00"))
                .type(Transaction.TransactionType.INCOME)
                .build();

        when(userService.getUserByEmail(anyString())).thenReturn(user);
        when(transactionRepository.findByIdAndUserId(any(), any())).thenReturn(Optional.of(transaction));

        // Start: 1000.00. Income was +150.00. Reverse means -150.00. -> 850.00
        transactionService.deleteTransaction(user.getEmail(), transaction.getId());

        assertThat(bankAccount.getCurrentBalance()).isEqualByComparingTo("850.00");
        verify(financialResourceRepository).save(bankAccount);
    }
}
