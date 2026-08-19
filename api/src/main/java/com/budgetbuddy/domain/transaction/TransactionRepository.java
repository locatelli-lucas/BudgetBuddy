package com.budgetbuddy.domain.transaction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID>, JpaSpecificationExecutor<Transaction> {
    
    Optional<Transaction> findByIdAndUserId(UUID id, UUID userId);
    
    Page<Transaction> findByUserId(UUID userId, Pageable pageable);
    
    List<Transaction> findTop5ByUserIdOrderByDateDescCreatedAtDesc(UUID userId);
    
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.type = :type " +
           "AND t.date >= :startDate AND t.date <= :endDate")
    BigDecimal sumAmountByUserIdAndTypeAndDateBetween(
            @Param("userId") UUID userId, 
            @Param("type") Transaction.TransactionType type, 
            @Param("startDate") LocalDate startDate, 
            @Param("endDate") LocalDate endDate);
            
    boolean existsByCategoryId(UUID categoryId);

    @Query("SELECT t.category.name, SUM(t.amount), t.category.color, t.category.icon " +
           "FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.type = com.budgetbuddy.domain.transaction.Transaction$TransactionType.EXPENSE " +
           "AND t.date >= :startDate AND t.date <= :endDate " +
           "GROUP BY t.category.name, t.category.color, t.category.icon")
    List<Object[]> aggregateExpensesByCategory(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT t.date, SUM(CASE WHEN t.type = com.budgetbuddy.domain.transaction.Transaction$TransactionType.INCOME THEN t.amount ELSE -t.amount END) " +
           "FROM Transaction t " +
           "WHERE t.user.id = :userId " +
           "AND t.date >= :startDate AND t.date <= :endDate " +
           "GROUP BY t.date ORDER BY t.date ASC")
    List<Object[]> aggregateDailyCashFlow(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
