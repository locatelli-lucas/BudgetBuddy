package com.budgetbuddy.domain.news.entity;

import com.budgetbuddy.domain.news.dto.NewsSentiment;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "news_article_analysis")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsArticleAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "asset_symbol", nullable = false)
    private String assetSymbol;

    @Column(nullable = false, length = 500)
    private String title;

    private String source;

    @Column(nullable = false, length = 1000)
    private String url;

    @Column(name = "published_at")
    private ZonedDateTime publishedAt;

    @Column(name = "article_content", columnDefinition = "TEXT")
    private String articleContent;

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    @Enumerated(EnumType.STRING)
    private NewsSentiment sentiment;

    @Column(columnDefinition = "TEXT")
    private String opportunities;

    @Column(columnDefinition = "TEXT")
    private String risks;

    @Column(name = "market_impact", columnDefinition = "TEXT")
    private String marketImpact;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
