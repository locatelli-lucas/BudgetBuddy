package com.budgetbuddy.domain.investment;

import com.budgetbuddy.domain.investment.dto.InvestmentDashboardResponse;
import com.budgetbuddy.domain.investment.dto.InvestmentRequest;
import com.budgetbuddy.domain.investment.dto.InvestmentResponse;
import com.budgetbuddy.domain.market.dto.QuoteResponse;
import com.budgetbuddy.domain.market.service.MarketService;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserService;
import com.budgetbuddy.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvestmentService {

    private final InvestmentRepository investmentRepository;
    private final UserService userService;
    private final MarketService marketService;
    private final PortfolioSnapshotService snapshotService;

    @Transactional(readOnly = true)
    public List<InvestmentResponse> getInvestments(String email) {
        User user = userService.getUserByEmail(email);
        return investmentRepository.findByUserId(user.getId()).stream()
                .map(this::mapToResponseWithMarketData)
                .toList();
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
        
        // Refresh snapshots after update
        snapshotService.generateSnapshotForUser(user);
        
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
        
        // Refresh snapshots after update
        snapshotService.generateSnapshotForUser(user);
        
        return mapToResponseWithMarketData(investment);
    }

    @Transactional
    public void deleteInvestment(String email, UUID id) {
        User user = userService.getUserByEmail(email);
        Investment investment = investmentRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Investment", id.toString()));
        investmentRepository.delete(investment);
        
        // Refresh snapshots after deletion
        snapshotService.generateSnapshotForUser(user);
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

            BigDecimal currentPrice = getCurrentPrice(inv.getTicker(), inv.getAvgPrice());
            currentTotalValue = currentTotalValue.add(inv.getQuantity().multiply(currentPrice));
        }

        BigDecimal netProfitLoss = currentTotalValue.subtract(totalInvested);
        BigDecimal returnPercent = BigDecimal.ZERO;

        if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {
            returnPercent = netProfitLoss.divide(totalInvested, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        return InvestmentDashboardResponse.builder()
                .totalInvested(totalInvested)
                .currentTotalValue(currentTotalValue)
                .netProfitLoss(netProfitLoss)
                .returnPercent(returnPercent)
                .build();
    }

    // ─── Private helpers ────────────────────────────────────────────────

    private InvestmentResponse mapToResponseWithMarketData(Investment investment) {
        BigDecimal currentPrice = getCurrentPrice(investment.getTicker(), investment.getAvgPrice());
        BigDecimal currentValue = investment.getQuantity().multiply(currentPrice);
        BigDecimal totalCost = investment.getQuantity().multiply(investment.getAvgPrice());

        BigDecimal profit = currentValue.subtract(totalCost);
        BigDecimal returnPercent = BigDecimal.ZERO;
        if (totalCost.compareTo(BigDecimal.ZERO) > 0) {
            returnPercent = profit.divide(totalCost, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        return InvestmentResponse.builder()
                .id(investment.getId())
                .ticker(investment.getTicker())
                .name(investment.getName())
                .type(investment.getType())
                .quantity(investment.getQuantity())
                .avgPrice(investment.getAvgPrice())
                .purchaseDate(investment.getPurchaseDate())
                .currentPrice(currentPrice)
                .currentValue(currentValue)
                .returnPercent(returnPercent)
                .build();
    }

    private BigDecimal getCurrentPrice(String ticker, BigDecimal fallback) {
        try {
            QuoteResponse quote = marketService.getQuote(ticker);
            return quote.getPrice();
        } catch (Exception e) {
            log.warn("Market data unavailable for {}, using avgPrice as fallback", ticker);
            return fallback;
        }
    }
}
