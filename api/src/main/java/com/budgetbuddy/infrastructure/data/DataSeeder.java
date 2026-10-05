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
        seedTestUser("test@test.com", "Lucas Teste", new BigDecimal("15000.00"));
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
            LocalDate now = LocalDate.now();
            int currentYear = now.getYear();

            for (int month = 1; month <= now.getMonthValue(); month++) {
                BigDecimal incomeAmount = new BigDecimal("4000").add(new BigDecimal(month * 100));
                BigDecimal expenseAmount = new BigDecimal("2000").add(new BigDecimal(month * 150));

                createTransaction(user, category, TransactionType.INCOME, incomeAmount, "Salary Month " + month, LocalDate.of(currentYear, month, 1));
                createTransaction(user, category, TransactionType.EXPENSE, expenseAmount, "Rent Month " + month, LocalDate.of(currentYear, month, 5));
                
                if (month % 2 == 0) {
                    createTransaction(user, category, TransactionType.EXPENSE, new BigDecimal("300.00"), "Extra Month " + month, LocalDate.of(currentYear, month, 15));
                }
            }
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
