package com.budgetbuddy.domain.investment;

import com.budgetbuddy.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "portfolio_snapshots")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "portfolio_value", nullable = false, precision = 15, scale = 4)
    private BigDecimal portfolioValue;

    @Column(name = "invested_amount", nullable = false, precision = 15, scale = 4)
    private BigDecimal investedAmount;

    @Column(name = "profit_loss", nullable = false, precision = 15, scale = 4)
    private BigDecimal profitLoss;

    @Column(name = "profit_loss_percentage", nullable = false, precision = 8, scale = 4)
    private BigDecimal profitLossPercentage;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
