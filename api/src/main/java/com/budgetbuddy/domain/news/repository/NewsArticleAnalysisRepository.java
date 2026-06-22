package com.budgetbuddy.domain.news.repository;

import com.budgetbuddy.domain.news.entity.NewsArticleAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NewsArticleAnalysisRepository extends JpaRepository<NewsArticleAnalysis, UUID> {
    Optional<NewsArticleAnalysis> findByUrl(String url);
    List<NewsArticleAnalysis> findByAssetSymbolAndPublishedAtAfter(String assetSymbol, ZonedDateTime publishedAt);
}
