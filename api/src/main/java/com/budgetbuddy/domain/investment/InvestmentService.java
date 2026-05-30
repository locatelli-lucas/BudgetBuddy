package com.budgetbuddy.domain.investment;

import com.budgetbuddy.domain.investment.dto.InvestmentDashboardResponse;
import com.budgetbuddy.domain.investment.dto.InvestmentRequest;
import com.budgetbuddy.domain.investment.dto.InvestmentResponse;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserService;
import com.budgetbuddy.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvestmentService {

    private final InvestmentRepository investmentRepository;
    private final UserService userService;
    // Will be added later: private final YahooFinanceService yahooFinanceService;

    @Transactional(readOnly = true)
    public List<InvestmentResponse> getInvestments(String email) {
        User user = userService.getUserByEmail(email);
        List<Investment> investments = investmentRepository.findByUserId(user.getId());
        
        return investments.stream().map(this::mapToResponseWithMarketData).collect(Collectors.toList());
    }

    @Transactional
    public InvestmentResponse addInvestment(String email, InvestmentRequest request) {
        User user = userService.getUserByEmail(email);
        
        Investment investment = Investment.builder()
                .user(user)
                .ticker(request.getTicker().toUpperCase())
                .name(request.getName())
                .type(request.getType())
                .quantity(request.getQuantity())
                .avgPrice(request.getAvgPrice())
                .purchaseDate(request.getPurchaseDate())
                .build();
                
        investment = investmentRepository.save(investment);
        return mapToResponseWithMarketData(investment);
    }

    @Transactional
    public InvestmentResponse updateInvestment(String email, UUID id, InvestmentRequest request) {
        User user = userService.getUserByEmail(email);
        Investment investment = investmentRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Investment", id.toString()));
                
        investment.setTicker(request.getTicker().toUpperCase());
        investment.setName(request.getName());
        investment.setType(request.getType());
        investment.setQuantity(request.getQuantity());
        investment.setAvgPrice(request.getAvgPrice());
        investment.setPurchaseDate(request.getPurchaseDate());
        
        investment = investmentRepository.save(investment);
        return mapToResponseWithMarketData(investment);
    }

    @Transactional
    public void deleteInvestment(String email, UUID id) {
        User user = userService.getUserByEmail(email);
        Investment investment = investmentRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Investment", id.toString()));
        investmentRepository.delete(investment);
    }

    @Transactional(readOnly = true)
    public InvestmentDashboardResponse getDashboard(String email) {
        User user = userService.getUserByEmail(email);
        List<Investment> investments = investmentRepository.findByUserId(user.getId());
        
        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal currentTotalValue = BigDecimal.ZERO;
        
        for (Investment inv : investments) {
            BigDecimal investedAmount = inv.getQuantity().multiply(inv.getAvgPrice());
            totalInvested = totalInvested.add(investedAmount);
            
            // Mocking current price for now, to be replaced by Yahoo Finance API integration
            BigDecimal mockCurrentPrice = inv.getAvgPrice().multiply(new BigDecimal("1.05")); // Mock 5% return
            BigDecimal currentValue = inv.getQuantity().multiply(mockCurrentPrice);
            currentTotalValue = currentTotalValue.add(currentValue);
        }
        
        BigDecimal netProfitLoss = currentTotalValue.subtract(totalInvested);
        BigDecimal returnPercent = BigDecimal.ZERO;
        
        if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {
            returnPercent = netProfitLoss.divide(totalInvested, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
        }
        
        return InvestmentDashboardResponse.builder()
                .totalInvested(totalInvested)
                .currentTotalValue(currentTotalValue)
                .netProfitLoss(netProfitLoss)
                .returnPercent(returnPercent)
                .build();
    }

    private InvestmentResponse mapToResponseWithMarketData(Investment investment) {
        // Mocking market data for Phase 5 initial setup
        BigDecimal mockCurrentPrice = investment.getAvgPrice().multiply(new BigDecimal("1.05"));
        BigDecimal currentValue = investment.getQuantity().multiply(mockCurrentPrice);
        
        BigDecimal totalCost = investment.getQuantity().multiply(investment.getAvgPrice());
        BigDecimal returnPercent = BigDecimal.ZERO;
        if (totalCost.compareTo(BigDecimal.ZERO) > 0) {
            returnPercent = currentValue.subtract(totalCost)
                    .divide(totalCost, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
        }
        
        return InvestmentResponse.builder()
                .id(investment.getId())
                .ticker(investment.getTicker())
                .name(investment.getName())
                .type(investment.getType())
                .quantity(investment.getQuantity())
                .avgPrice(investment.getAvgPrice())
                .purchaseDate(investment.getPurchaseDate())
                .currentPrice(mockCurrentPrice)
                .currentValue(currentValue)
                .returnPercent(returnPercent)
                .build();
    }
}
