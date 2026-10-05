package com.budgetbuddy.domain.installment;

import com.budgetbuddy.domain.category.Category;
import com.budgetbuddy.domain.category.CategoryService;
import com.budgetbuddy.domain.financialresource.FinancialResource;
import com.budgetbuddy.domain.financialresource.FinancialResourceRepository;
import com.budgetbuddy.domain.financialresource.FinancialResourceService;
import com.budgetbuddy.domain.financialresource.FinancialResourceType;
import com.budgetbuddy.domain.installment.dto.InstallmentPurchaseRequest;
import com.budgetbuddy.domain.installment.dto.InstallmentPurchaseResponse;
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
class InstallmentServiceTest {

    @Mock
    private InstallmentPurchaseRepository installmentPurchaseRepository;
    @Mock
    private InstallmentEntryRepository installmentEntryRepository;
    @Mock
    private UserService userService;
    @Mock
    private CategoryService categoryService;
    @Mock
    private FinancialResourceRepository financialResourceRepository;
    @Mock
    private FinancialResourceService financialResourceService;

    @InjectMocks
    private InstallmentService installmentService;

    private User user;
    private Category category;
    private FinancialResource creditCard;

    @BeforeEach
    void setUp() {
        user = User.builder().id(UUID.randomUUID()).email("test@example.com").build();
        category = Category.builder().id(UUID.randomUUID()).name("Shopping").build();
        creditCard = FinancialResource.builder()
                .id(UUID.randomUUID())
                .name("Nubank")
                .type(FinancialResourceType.CREDIT_CARD)
                .invoiceClosingDay(10)
                .invoiceDueDay(15)
                .build();
    }

    @Test
    @DisplayName("Should create installment purchase with rounding adjustment")
    void shouldCreateInstallmentsWithRounding() {
        InstallmentPurchaseRequest request = InstallmentPurchaseRequest.builder()
                .categoryId(category.getId())
                .financialResourceId(creditCard.getId())
                .description("Notebook")
                .totalAmount(new BigDecimal("100.00"))
                .installmentsCount(3)
                .purchaseDate(LocalDate.of(2023, 10, 5))
                .build();

        when(userService.getUserByEmail(anyString())).thenReturn(user);
        when(categoryService.getCategoryEntity(any(), any())).thenReturn(category);
        when(financialResourceRepository.findByIdAndUserId(any(), any())).thenReturn(Optional.of(creditCard));
        when(installmentPurchaseRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);
        when(installmentEntryRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        InstallmentPurchaseResponse response = installmentService.createInstallmentPurchase(user.getEmail(), request);

        assertThat(response.getInstallments()).hasSize(3);
        // 100 / 3 = 33.33. Total = 99.99. Last should be 33.34
        assertThat(response.getInstallments().get(0).getAmount()).isEqualByComparingTo("33.33");
        assertThat(response.getInstallments().get(1).getAmount()).isEqualByComparingTo("33.33");
        assertThat(response.getInstallments().get(2).getAmount()).isEqualByComparingTo("33.34");
    }

    @Test
    @DisplayName("Should calculate correct due dates for credit card after closing day")
    void shouldCalculateDueDatesAfterClosing() {
        // Purchase on 12th, closing is 10th. First installment should be next month (Nov 15)
        InstallmentPurchaseRequest request = InstallmentPurchaseRequest.builder()
                .categoryId(category.getId())
                .financialResourceId(creditCard.getId())
                .description("Lunch")
                .totalAmount(new BigDecimal("60.00"))
                .installmentsCount(2)
                .purchaseDate(LocalDate.of(2023, 10, 12))
                .build();

        when(userService.getUserByEmail(anyString())).thenReturn(user);
        when(categoryService.getCategoryEntity(any(), any())).thenReturn(category);
        when(financialResourceRepository.findByIdAndUserId(any(), any())).thenReturn(Optional.of(creditCard));
        when(installmentPurchaseRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);
        when(installmentEntryRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        InstallmentPurchaseResponse response = installmentService.createInstallmentPurchase(user.getEmail(), request);

        assertThat(response.getInstallments().get(0).getDueDate()).isEqualTo(LocalDate.of(2023, 11, 15));
        assertThat(response.getInstallments().get(1).getDueDate()).isEqualTo(LocalDate.of(2023, 12, 15));
    }

    @Test
    @DisplayName("Should calculate correct due dates for credit card before closing day")
    void shouldCalculateDueDatesBeforeClosing() {
        // Purchase on 5th, closing is 10th. First installment should be current month (Oct 15)
        InstallmentPurchaseRequest request = InstallmentPurchaseRequest.builder()
                .categoryId(category.getId())
                .financialResourceId(creditCard.getId())
                .description("Coffee")
                .totalAmount(new BigDecimal("10.00"))
                .installmentsCount(1)
                .purchaseDate(LocalDate.of(2023, 10, 5))
                .build();

        when(userService.getUserByEmail(anyString())).thenReturn(user);
        when(categoryService.getCategoryEntity(any(), any())).thenReturn(category);
        when(financialResourceRepository.findByIdAndUserId(any(), any())).thenReturn(Optional.of(creditCard));
        when(installmentPurchaseRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);
        when(installmentEntryRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        InstallmentPurchaseResponse response = installmentService.createInstallmentPurchase(user.getEmail(), request);

        assertThat(response.getInstallments().get(0).getDueDate()).isEqualTo(LocalDate.of(2023, 10, 15));
    }

    @Test
    @DisplayName("Should handle historical purchases marking previous installments as PAID")
    void shouldHandleHistoricalPurchases() {
        InstallmentPurchaseRequest request = InstallmentPurchaseRequest.builder()
                .categoryId(category.getId())
                .financialResourceId(creditCard.getId())
                .description("Old Purchase")
                .totalAmount(new BigDecimal("100.00"))
                .installmentsCount(4)
                .purchaseDate(LocalDate.of(2023, 8, 5))
                .isHistorical(true)
                .firstInstallmentNumber(3) // 1 and 2 are paid
                .build();

        when(userService.getUserByEmail(anyString())).thenReturn(user);
        when(categoryService.getCategoryEntity(any(), any())).thenReturn(category);
        when(financialResourceRepository.findByIdAndUserId(any(), any())).thenReturn(Optional.of(creditCard));
        when(installmentPurchaseRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);
        when(installmentEntryRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        InstallmentPurchaseResponse response = installmentService.createInstallmentPurchase(user.getEmail(), request);

        assertThat(response.getInstallments().get(0).getStatus()).isEqualTo(InstallmentStatus.PAID);
        assertThat(response.getInstallments().get(1).getStatus()).isEqualTo(InstallmentStatus.PAID);
        assertThat(response.getInstallments().get(2).getStatus()).isEqualTo(InstallmentStatus.PENDING);
        assertThat(response.getInstallments().get(3).getStatus()).isEqualTo(InstallmentStatus.PENDING);
    }
}
