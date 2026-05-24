package com.budgetbuddy.infrastructure.finance;

import com.budgetbuddy.infrastructure.finance.dto.QuoteResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Service
public class YahooFinanceService {

    public QuoteResponse getQuote(String ticker) {
        // Mocking Yahoo Finance API call
        log.info("Fetching quote from Yahoo Finance for: {}", ticker);
        return QuoteResponse.builder()
                .ticker(ticker)
                .price(new BigDecimal("150.25"))
                .change(new BigDecimal("2.50"))
                .changePercent(new BigDecimal("1.69"))
                .build();
    }
}
