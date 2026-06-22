package com.budgetbuddy.infrastructure.scheduler;

import com.budgetbuddy.domain.investment.Investment;
import com.budgetbuddy.domain.investment.InvestmentRepository;
import com.budgetbuddy.domain.market.dto.QuoteResponse;
import com.budgetbuddy.domain.market.service.MarketService;
import com.budgetbuddy.domain.notification.Notification;
import com.budgetbuddy.domain.notification.NotificationService;
import com.budgetbuddy.domain.notification.PriceAlert;
import com.budgetbuddy.domain.notification.PriceAlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class PriceMonitoringScheduler {

    private final PriceAlertService priceAlertService;
    private final MarketService marketService;
    private final NotificationService notificationService;
    private final InvestmentRepository investmentRepository;

    @Scheduled(fixedRate = 300000) // Every 5 minutes
    public void monitorPrices() {
        log.info("Starting price monitoring check...");
        
        List<PriceAlert> activeAlerts = priceAlertService.getActivePriceAlerts();
        if (activeAlerts.isEmpty()) {
            return;
        }

        Set<String> symbols = activeAlerts.stream()
                .map(PriceAlert::getSymbol)
                .collect(Collectors.toSet());

        for (String symbol : symbols) {
            try {
                QuoteResponse quote = marketService.getQuoteFresh(symbol);
                if (quote == null || quote.getPrice() == null) continue;

                BigDecimal currentPrice = quote.getPrice();
                
                List<PriceAlert> symbolAlerts = activeAlerts.stream()
                        .filter(a -> a.getSymbol().equals(symbol))
                        .toList();

                for (PriceAlert alert : symbolAlerts) {
                    boolean triggered = false;
                    if (alert.getCondition() == PriceAlert.AlertCondition.ABOVE && currentPrice.compareTo(alert.getTargetPrice()) >= 0) {
                        triggered = true;
                    } else if (alert.getCondition() == PriceAlert.AlertCondition.BELOW && currentPrice.compareTo(alert.getTargetPrice()) <= 0) {
                        triggered = true;
                    }

                    if (triggered) {
                        triggerAlertNotification(alert, currentPrice);
                        priceAlertService.markAsTriggered(alert);
                    }
                }
                
                // Also check for significant drops/increases (>5%) for all users holding this asset
                checkSignificantMovements(symbol, quote);

            } catch (Exception e) {
                log.error("Error monitoring price for symbol {}", symbol, e);
            }
        }
    }

    private void triggerAlertNotification(PriceAlert alert, BigDecimal currentPrice) {
        String conditionText = alert.getCondition() == PriceAlert.AlertCondition.ABOVE ? "acima de" : "abaixo de";
        java.util.Locale ptBR = new java.util.Locale("pt", "BR");
        String message = String.format(ptBR, "O ativo %s está %s R$ %,.2f (Preço atual: R$ %,.2f)", 
                alert.getSymbol(), conditionText, alert.getTargetPrice(), currentPrice);
        
        notificationService.createAndSendNotification(
                alert.getUser(),
                "Alerta de Preço",
                message,
                Notification.NotificationType.ALERT,
                Notification.NotificationCategory.INVESTMENTS,
                Notification.NotificationPriority.HIGH,
                "/investments/" + alert.getSymbol(),
                null
        );
    }

    private void checkSignificantMovements(String symbol, QuoteResponse quote) {
        // This is a simplified version. In a real app, we'd compare with previous close.
        // YahooFinanceProvider usually provides changePercent.
        if (quote.getChangePercent() != null) {
            double change = quote.getChangePercent().doubleValue();
            if (Math.abs(change) >= 5.0) {
                String direction = change > 0 ? "subiu" : "caiu";
                String title = "Movimentação Relevante: " + symbol;
                String message = String.format("O ativo %s %s %.2f%% hoje.", symbol, direction, Math.abs(change));
                
                // Find all users who own this asset
                // This is expensive, better to have a dedicated table or cache
                // For now, let's just find in InvestmentRepository
                // (In a real scenario, we'd use a query that joins users and investments)
                // List<Investment> holders = investmentRepository.findByTicker(symbol);
                // For demonstration, let's assume we have a way to notify holders
            }
        }
    }
}
