package com.budgetbuddy.domain.market.provider;

import com.budgetbuddy.domain.market.dto.HistoricalPoint;
import com.budgetbuddy.domain.market.dto.QuoteResponse;
import com.budgetbuddy.domain.market.dto.SearchResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.util.retry.Retry;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class YahooFinanceProvider implements MarketDataProvider {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public YahooFinanceProvider(
            @Value("${finance.yahoo-base-url}") String baseUrl,
            ObjectMapper objectMapper) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("User-Agent", "Mozilla/5.0")
                .build();
        this.objectMapper = objectMapper;
    }

    @Override
    public QuoteResponse getQuote(String symbol) {
        String normalized = normalizeSymbol(symbol);
        try {
            JsonNode root = fetchChart(normalized, "1d", "1d");
            if (root == null || root.path("chart").path("result").isNull() || root.path("chart").path("result").isEmpty()) {
                return createDummyQuote(symbol);
            }
            JsonNode meta = root.path("chart").path("result").get(0).path("meta");

            BigDecimal price = decimal(meta.path("regularMarketPrice"));
            BigDecimal previousClose = decimal(meta.path("previousClose"));
            BigDecimal change = price.subtract(previousClose);
            BigDecimal changePercent = BigDecimal.ZERO;
            if (previousClose.compareTo(BigDecimal.ZERO) > 0) {
                changePercent = change.divide(previousClose, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }

            String rawName = meta.path("shortName").asText(meta.path("symbol").asText(symbol));
            String cleanName = cleanCompanyName(rawName);

            return QuoteResponse.builder()
                    .symbol(symbol.toUpperCase())
                    .name(cleanName)
                    .price(price)
                    .change(change)
                    .changePercent(changePercent)
                    .previousClose(previousClose)
                    .currency(meta.path("currency").asText("BRL"))
                    .lastUpdated(Instant.now())
                    .build();
        } catch (Exception e) {
            log.error("Failed to fetch quote for {}", symbol, e);
            return createDummyQuote(symbol);
        }
    }

    private QuoteResponse createDummyQuote(String symbol) {
        return QuoteResponse.builder()
                .symbol(symbol.toUpperCase())
                .name(symbol.toUpperCase() + " (Price Unavailable)")
                .price(BigDecimal.ZERO)
                .change(BigDecimal.ZERO)
                .changePercent(BigDecimal.ZERO)
                .previousClose(BigDecimal.ZERO)
                .currency("BRL")
                .lastUpdated(Instant.now())
                .build();
    }

    @Override
    public List<QuoteResponse> getQuotes(List<String> symbols) {
        return symbols.stream()
                .map(this::getQuote)
                .toList();
    }

    @Override
    public List<HistoricalPoint> getHistoricalData(String symbol, String period) {
        String normalized = normalizeSymbol(symbol);
        String range = mapPeriod(period);
        try {
            JsonNode root = fetchChart(normalized, range, range);
            if (root == null || root.path("chart").path("result").isNull() || root.path("chart").path("result").isEmpty()) {
                return Collections.emptyList();
            }
            JsonNode result = root.path("chart").path("result").get(0);
            JsonNode timestamps = result.path("timestamp");
            JsonNode quotes = result.path("indicators").path("quote").get(0);
            JsonNode opens = quotes.path("open");
            JsonNode highs = quotes.path("high");
            JsonNode lows = quotes.path("low");
            JsonNode closes = quotes.path("close");
            JsonNode volumes = quotes.path("volume");

            List<HistoricalPoint> points = new ArrayList<>();
            for (int i = 0; i < timestamps.size(); i++) {
                if (closes.get(i).isNull()) continue;
                points.add(HistoricalPoint.builder()
                        .date(LocalDate.ofInstant(
                                Instant.ofEpochSecond(timestamps.get(i).asLong()),
                                ZoneOffset.UTC))
                        .open(decimal(opens.get(i)))
                        .high(decimal(highs.get(i)))
                        .low(decimal(lows.get(i)))
                        .close(decimal(closes.get(i)))
                        .volume(volumes.get(i).asLong())
                        .build());
            }
            return points;
        } catch (Exception e) {
            log.error("Failed to fetch history for {} period {}", symbol, period, e);
            throw new MarketDataException("Failed to fetch history for " + symbol, e);
        }
    }

    @Override
    public List<SearchResult> searchAsset(String query) {
        try {
            JsonNode root = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1/finance/search")
                            .queryParam("q", query)
                            .queryParam("quotesCount", 10)
                            .build())
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .retryWhen(Retry.backoff(3, Duration.ofSeconds(1)))
                    .block();

            List<SearchResult> results = new ArrayList<>();
            JsonNode quotes = root.path("quotes");
            for (JsonNode q : quotes) {
                String type = q.path("quoteType").asText("");
                if (!List.of("EQUITY", "ETF", "FUTURE").contains(type)) continue;
                results.add(SearchResult.builder()
                        .symbol(q.path("symbol").asText())
                        .name(q.path("shortname").asText(q.path("longname").asText("")))
                        .exchange(q.path("exchange").asText(""))
                        .type(type)
                        .build());
            }
            return results;
        } catch (Exception e) {
            log.error("Failed to search assets for query {}", query, e);
            return Collections.emptyList();
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────────────

    private JsonNode fetchChart(String symbol, String range, String interval) {
        try {
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v8/finance/chart/{symbol}")
                            .queryParam("range", range)
                            .queryParam("interval", interval)
                            .build(symbol))
                    .retrieve()
                    .onStatus(HttpStatus.TOO_MANY_REQUESTS::equals,
                            resp -> { throw new MarketDataException("Rate limited by Yahoo Finance"); })
                    .bodyToMono(JsonNode.class)
                    .retryWhen(Retry.backoff(3, Duration.ofSeconds(2)))
                    .block();
        } catch (WebClientResponseException.NotFound e) {
            log.warn("Symbol not found on Yahoo Finance: {}", symbol);
            return null;
        }
    }

    /** Normalize symbol for Yahoo Finance — Brazilian stocks get .SA suffix */
    private String normalizeSymbol(String symbol) {
        String upper = symbol.toUpperCase().trim();
        if (upper.contains(".")) return upper;
        // Common Brazilian tickers: 4 letters + number, or 5 letters
        if (upper.matches("[A-Z]{4}\\d") || (upper.matches("[A-Z]{5,6}") && !upper.startsWith("^"))) {
            return upper + ".SA";
        }
        return upper;
    }

    private String mapPeriod(String period) {
        return switch (period.toUpperCase()) {
            case "1D" -> "1d";
            case "5D" -> "5d";
            case "1M" -> "1mo";
            case "6M" -> "6mo";
            case "1Y" -> "1y";
            case "5Y" -> "5y";
            default -> "1mo";
        };
    }

    private BigDecimal decimal(JsonNode node) {
        if (node == null || node.isNull()) return BigDecimal.ZERO;
        return BigDecimal.valueOf(node.asDouble()).setScale(4, RoundingMode.HALF_UP);
    }

    /** Strip Brazilian stock class suffixes (PN, ON, N1, N2, NM, etc.) from company name */
    private String cleanCompanyName(String raw) {
        if (raw == null || raw.isEmpty()) return raw;
        // Remove trailing stock class: "PETROBRAS PN N2" → "PETROBRAS"
        return raw.replaceAll("\\s+(PN|ON|UNIT|N1|N2|NM|MA|DR[1-3]|EDJ?|EDR?)(\\s+N[1-2M])?$", "").trim();
    }
}
