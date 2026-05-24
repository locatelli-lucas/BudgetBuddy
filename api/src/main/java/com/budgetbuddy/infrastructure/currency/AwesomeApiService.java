package com.budgetbuddy.infrastructure.currency;

import com.budgetbuddy.infrastructure.currency.dto.CurrencyRateResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Service
public class AwesomeApiService {

    public CurrencyRateResponse getExchangeRate(String from, String to) {
        // Mocking AwesomeAPI call (e.g. USD-BRL)
        log.info("Fetching exchange rate from AwesomeAPI: {}-{}", from, to);
        return CurrencyRateResponse.builder()
                .code(from)
                .codein(to)
                .name(from + "/" + to)
                .bid(new BigDecimal("5.12"))
                .ask(new BigDecimal("5.13"))
                .createDate("2026-05-24 14:00:00")
                .build();
    }
}
