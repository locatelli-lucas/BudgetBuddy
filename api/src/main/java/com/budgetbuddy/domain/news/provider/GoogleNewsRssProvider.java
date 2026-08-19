package com.budgetbuddy.domain.news.provider;

import com.budgetbuddy.domain.news.dto.NewsArticleResponse;
import com.budgetbuddy.domain.news.dto.NewsSentiment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Slf4j
@Component
@Primary
public class GoogleNewsRssProvider implements NewsProvider {

    private final WebClient webClient;
    private static final String BASE_URL = "https://news.google.com/rss/search";
    private static final DateTimeFormatter RFC_1123_FORMATTER = 
            DateTimeFormatter.ofPattern("EEE, dd MMM yyyy HH:mm:ss z", Locale.ENGLISH);

    public GoogleNewsRssProvider(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://news.google.com").build();
    }

    @Override
    public List<NewsArticleResponse> getAssetNews(String symbol, String query, int page, int size) {
        try {
            String rssContent = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/rss/search")
                            .queryParam("q", query + " " + symbol)
                            .queryParam("hl", "pt-BR")
                            .queryParam("gl", "BR")
                            .queryParam("ceid", "BR:pt-419")
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (rssContent == null) return new ArrayList<>();

            return parseRss(rssContent).stream()
                    .skip((long) (page - 1) * size)
                    .limit(size)
                    .toList();

        } catch (Exception e) {
            log.error("Failed to fetch news from Google News RSS for symbol: {}", symbol, e);
            return new ArrayList<>();
        }
    }

    private List<NewsArticleResponse> parseRss(String xml) throws Exception {
        List<NewsArticleResponse> articles = new ArrayList<>();
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));

        NodeList items = doc.getElementsByTagName("item");

        for (int i = 0; i < items.getLength(); i++) {
            Element item = (Element) items.item(i);
            
            String title = getTagValue(item, "title");
            String url = getTagValue(item, "link");
            String pubDate = getTagValue(item, "pubDate");
            String description = getTagValue(item, "description");
            String source = getTagValue(item, "source");

            ZonedDateTime publishedAt = ZonedDateTime.now();
            try {
                publishedAt = ZonedDateTime.parse(pubDate, RFC_1123_FORMATTER);
            } catch (Exception e) {
                log.warn("Failed to parse date: {}", pubDate);
            }

            articles.add(NewsArticleResponse.builder()
                    .id(url) // Using URL as ID
                    .title(title)
                    .summary(cleanHtml(description))
                    .source(source != null ? source : "Google News")
                    .url(url)
                    .publishedAt(publishedAt)
                    .sentiment(NewsSentiment.NEUTRAL) // Default, will be updated by AI if needed or refined
                    .imageUrl(null) // RSS usually doesn't have a direct image tag without namespaces
                    .build());
        }

        return articles;
    }

    private String getTagValue(Element element, String tagName) {
        NodeList nodeList = element.getElementsByTagName(tagName);
        if (nodeList != null && nodeList.getLength() > 0) {
            return nodeList.item(0).getTextContent();
        }
        return null;
    }

    private String cleanHtml(String html) {
        if (html == null) return "";
        return html.replaceAll("<[^>]*>", "").trim();
    }
}
