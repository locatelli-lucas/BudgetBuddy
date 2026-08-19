package com.budgetbuddy.infrastructure.data;

import com.budgetbuddy.domain.category.Category;
import com.budgetbuddy.domain.category.CategoryService;
import com.budgetbuddy.domain.investment.Investment.InvestmentType;
import com.budgetbuddy.domain.investment.InvestmentService;
import com.budgetbuddy.domain.investment.dto.InvestmentRequest;
import com.budgetbuddy.domain.transaction.PaymentMethod;
import com.budgetbuddy.domain.transaction.Transaction;
import com.budgetbuddy.domain.transaction.TransactionService;
import com.budgetbuddy.domain.transaction.dto.TransactionRequest;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataGeneratorService {

    private final TransactionService transactionService;
    private final InvestmentService investmentService;
    private final UserRepository userRepository;
    private final CategoryService categoryService;

    private final Random random = new Random();
    private final List<String> TEST_USERS = List.of("test1@test.com", "test2@test.com");

    private final String[] TICKERS = {"ITUB4", "VALE3", "PETR4", "BBDC4", "ABEV3", "BBAS3", "IVVB11", "BOVA11"};
    private final String[] DESCRIPTIONS = {"Supermarket", "Gas Station", "Restaurant", "Pharmacy", "Uber", "Amazon", "Netflix", "Gym"};

    @Scheduled(fixedDelay = 120000) // 2 minutes
    public void generateData() {
        String email = TEST_USERS.get(random.nextInt(TEST_USERS.size()));
        userRepository.findByEmail(email).ifPresent(user -> {
            log.info("Generating random data for user: {}", email);
            generateRandomTransaction(user);
            generateRandomInvestment(user);
        });
    }

    private void generateRandomTransaction(User user) {
        try {
            List<Category> categories = categoryService.getAllCategoryEntities(user.getId());
            if (categories.isEmpty()) return;

            Category category = categories.get(random.nextInt(categories.size()));
            BigDecimal amount = BigDecimal.valueOf(random.nextDouble() * 200 + 10)
                    .setScale(2, RoundingMode.HALF_UP);

            TransactionRequest request = TransactionRequest.builder()
                    .categoryId(category.getId())
                    .type(Transaction.TransactionType.EXPENSE)
                    .amount(amount)
                    .description(DESCRIPTIONS[random.nextInt(DESCRIPTIONS.length)])
                    .date(LocalDate.now())
                    .paymentMethod(PaymentMethod.CREDIT_CARD)
                    .build();

            transactionService.createTransaction(user.getEmail(), request);
            log.info("Generated transaction for {}: {} {}", user.getEmail(), category.getName(), amount);
        } catch (Exception e) {
            log.error("Failed to generate random transaction", e);
        }
    }

    private void generateRandomInvestment(User user) {
        try {
            String ticker = TICKERS[random.nextInt(TICKERS.length)];
            BigDecimal quantity = BigDecimal.valueOf(random.nextInt(10) + 1);
            BigDecimal price = BigDecimal.valueOf(random.nextDouble() * 50 + 10)
                    .setScale(2, RoundingMode.HALF_UP);

            InvestmentRequest request = InvestmentRequest.builder()
                    .ticker(ticker)
                    .name(ticker + " Stock")
                    .type(InvestmentType.STOCK)
                    .quantity(quantity)
                    .avgPrice(price)
                    .purchaseDate(LocalDate.now())
                    .build();

            investmentService.addInvestment(user.getEmail(), request);
            log.info("Generated investment for {}: {} {} @ {}", user.getEmail(), ticker, quantity, price);
        } catch (Exception e) {
            log.error("Failed to generate random investment", e);
        }
    }
}
