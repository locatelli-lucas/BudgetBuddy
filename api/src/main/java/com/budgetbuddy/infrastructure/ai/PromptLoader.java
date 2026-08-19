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
            ClassPathResource resource = new ClassPathResource("prompts.yaml");
            try (InputStream inputStream = resource.getInputStream()) {
                Map<String, Object> obj = yaml.load(inputStream);
                if (obj != null && obj.containsKey("prompts")) {
                    this.prompts = (Map<String, String>) obj.get("prompts");
                    log.info("Successfully loaded {} prompts from prompts.yaml", prompts.size());
                }
            }
        } catch (Exception e) {
            log.error("Failed to load prompts.yaml", e);
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
