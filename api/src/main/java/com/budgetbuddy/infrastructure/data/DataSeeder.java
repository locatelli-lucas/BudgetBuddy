package com.budgetbuddy.infrastructure.data;

import com.budgetbuddy.domain.category.Category;
import com.budgetbuddy.domain.category.Category.CategoryType;
import com.budgetbuddy.domain.category.CategoryRepository;
import com.budgetbuddy.domain.financialresource.FinancialResource;
import com.budgetbuddy.domain.financialresource.FinancialResourceRepository;
import com.budgetbuddy.domain.financialresource.FinancialResourceType;
import com.budgetbuddy.domain.transaction.PaymentMethod;
import com.budgetbuddy.domain.transaction.Transaction;
import com.budgetbuddy.domain.transaction.Transaction.TransactionType;
import com.budgetbuddy.domain.transaction.TransactionRepository;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FinancialResourceRepository financialResourceRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedData() {
        seedTestUser("test1@test.com", "Test User 1", new BigDecimal("-5000.00"));
        seedTestUser("test2@test.com", "Test User 2", new BigDecimal("10000.00"));
    }

    private void seedTestUser(String email, String name, BigDecimal initialBalance) {
        if (userRepository.findByEmail(email).isEmpty()) {
            log.info("Seeding test user: {}", email);
            User user = User.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode("123456"))
                    .emailVerified(true)
                    .premium(true)
                    .build();
            user = userRepository.save(user);

            seedFinancialResources(user, initialBalance);
            seedCategories(user);
            seedInitialTransactions(user);
        }
    }

    private void seedFinancialResources(User user, BigDecimal balance) {
        FinancialResource checking = FinancialResource.builder()
                .user(user)
                .name("Main Bank Account")
                .type(FinancialResourceType.CHECKING_ACCOUNT)
                .currentBalance(balance)
                .isActive(true)
                .build();
        financialResourceRepository.save(checking);
    }

    private void seedCategories(User user) {
        if (categoryRepository.findByUserIdOrIsDefaultTrue(user.getId()).isEmpty()) {
            Category food = Category.builder()
                    .name("Food")
                    .icon("fastfood")
                    .color("#FF5733")
                    .type(CategoryType.EXPENSE)
                    .isDefault(true)
                    .build();
            categoryRepository.save(food);

            Category leisure = Category.builder()
                    .name("Leisure")
                    .icon("movie")
                    .color("#3357FF")
                    .type(CategoryType.EXPENSE)
                    .isDefault(true)
                    .build();
            categoryRepository.save(leisure);
        }
    }

    private void seedInitialTransactions(User user) {
        Category category = categoryRepository.findByUserIdOrIsDefaultTrue(user.getId())
                .stream().findFirst().orElse(null);

        if (category != null) {
            // April 2026
            createTransaction(user, category, TransactionType.INCOME, new BigDecimal("5000.00"), "Salary April", LocalDate.of(2026, 4, 1));
            createTransaction(user, category, TransactionType.EXPENSE, new BigDecimal("1200.00"), "Rent April", LocalDate.of(2026, 4, 5));
            
            // May 2026
            createTransaction(user, category, TransactionType.INCOME, new BigDecimal("5200.00"), "Salary May", LocalDate.of(2026, 5, 1));
            createTransaction(user, category, TransactionType.EXPENSE, new BigDecimal("1500.00"), "Rent May", LocalDate.of(2026, 5, 5));
            createTransaction(user, category, TransactionType.EXPENSE, new BigDecimal("300.00"), "Eating Out May", LocalDate.of(2026, 5, 15));

            // June 2026
            createTransaction(user, category, TransactionType.INCOME, new BigDecimal("5500.00"), "Salary June", LocalDate.of(2026, 6, 1));
            createTransaction(user, category, TransactionType.EXPENSE, new BigDecimal("1600.00"), "Rent June", LocalDate.of(2026, 6, 5));
            createTransaction(user, category, TransactionType.EXPENSE, new BigDecimal("200.00"), "Luxury June", LocalDate.of(2026, 6, 10));

            // July 2026
            createTransaction(user, category, TransactionType.INCOME, new BigDecimal("6000.00"), "Salary July", LocalDate.of(2026, 7, 1));
            createTransaction(user, category, TransactionType.EXPENSE, new BigDecimal("1800.00"), "Rent July", LocalDate.of(2026, 7, 5));

            // August 2026
            createTransaction(user, category, TransactionType.INCOME, new BigDecimal("6300.00"), "Salary August", LocalDate.of(2026, 8, 1));
            createTransaction(user, category, TransactionType.EXPENSE, new BigDecimal("1850.00"), "Rent August", LocalDate.of(2026, 8, 5));
        }
    }

    private void createTransaction(User user, Category category, TransactionType type, BigDecimal amount, String desc, LocalDate date) {
        Transaction t = Transaction.builder()
                .user(user)
                .category(category)
                .type(type)
                .amount(amount)
                .description(desc)
                .date(date)
                .paymentMethod(PaymentMethod.BANK_TRANSFER)
                .build();
        transactionRepository.save(t);
    }
}
