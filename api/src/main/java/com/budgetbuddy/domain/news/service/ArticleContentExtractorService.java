package com.budgetbuddy.domain.news.service;

import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Slf4j
@Service
public class ArticleContentExtractorService {

    public String extractContent(String url) {
        try {
            log.info("Extracting content from URL: {}", url);
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .timeout(10000)
                    .get();

            // Remove unwanted elements
            doc.select("script, style, nav, footer, header, aside, .ads, .advertisement, .social-share, .comments").remove();

            // Try to find the main content
            Element content = findMainContent(doc);
            
            if (content == null) {
                return doc.body().text();
            }

            // Further clean the content element
            cleanElement(content);

            return content.text();
        } catch (IOException e) {
            log.error("Failed to extract content from {}: {}", url, e.getMessage());
            return "";
        }
    }

    private Element findMainContent(Document doc) {
        // Common main content tags/classes
        String[] selectors = {
            "article", "main", "[role=main]", ".post-content", ".article-content", ".entry-content", ".content-body", "#article-body"
        };

        for (String selector : selectors) {
            Element found = doc.selectFirst(selector);
            if (found != null) return found;
        }

        return null;
    }

    private void cleanElement(Element element) {
        // Remove links but keep text
        element.select("a").unwrap();
        
        // Remove small/unrelated blocks often found in articles
        element.select("iframe, img, button, input").remove();
    }
}
