package com.budgetbuddy.domain.insight;

import com.budgetbuddy.domain.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_insights")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiInsight {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private InsightType type;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String body;

    @Column(nullable = false, length = 100)
    private String icon;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InsightSeverity severity;

    @Column(name = "reference_id")
    private UUID referenceId; // links to budget/transaction if applicable

    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum InsightType {
        ALERT, RECOMMENDATION, PROGRESS
    }

    public enum InsightSeverity {
        INFO, WARNING, ERROR, SUCCESS
    }
}
