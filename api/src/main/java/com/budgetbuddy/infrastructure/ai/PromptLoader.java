package com.budgetbuddy.infrastructure.ai;

import lombok.extern.slf4j.Slf4j;
import org.yaml.snakeyaml.Yaml;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.util.Collections;
import java.util.Map;

@Slf4j
@Component
public class PromptLoader {

    private Map<String, String> prompts = Collections.emptyMap();

    @PostConstruct
    public void init() {
        try {
            Yaml yaml = new Yaml();
            // Try loading from prompts.yaml first
            ClassPathResource resource = new ClassPathResource("prompts.yaml");
            if (resource.exists()) {
                try (InputStream inputStream = resource.getInputStream()) {
                    Map<String, Object> obj = yaml.load(inputStream);
                    if (obj != null && obj.containsKey("prompts")) {
                        this.prompts = (Map<String, String>) obj.get("prompts");
                        log.info("Successfully loaded {} prompts from prompts.yaml", prompts.size());
                        return;
                    }
                }
            }

            // Fallback: search for individual .md files in prompts/ directory
            log.warn("prompts.yaml not found or empty, falling back to individual .md files");
            this.prompts = new java.util.HashMap<>();
            String[] promptFiles = {
                "categorization", "financial-insights", "chat-system", 
                "news-summary", "monthly-report", "portfolio-analysis", "expense-analysis"
            };

            for (String name : promptFiles) {
                try {
                    ClassPathResource mdResource = new ClassPathResource("prompts/" + name + ".md");
                    if (mdResource.exists()) {
                        try (InputStream is = mdResource.getInputStream()) {
                            String content = new String(is.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
                            this.prompts.put(name, content);
                        }
                    }
                } catch (Exception e) {
                    log.warn("Failed to load prompt file: prompts/{}.md", name);
                }
            }
            log.info("Loaded {} prompts from individual files", prompts.size());

        } catch (Exception e) {
            log.error("Critical failure loading prompts", e);
        }
    }

    public String load(String name, Map<String, Object> variables) {
        String template = prompts.get(name);
        if (template == null) {
            log.error("Prompt template not found: {}", name);
            throw new RuntimeException("Prompt template not found: " + name);
        }
        
        String result = template;
        for (Map.Entry<String, Object> entry : variables.entrySet()) {
            result = result.replace("{{" + entry.getKey() + "}}", String.valueOf(entry.getValue()));
        }
        
        return result;
    }
}
