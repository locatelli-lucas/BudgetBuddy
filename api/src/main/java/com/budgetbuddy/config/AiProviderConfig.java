package com.budgetbuddy.config;

import com.budgetbuddy.infrastructure.ai.AiProvider;
import com.budgetbuddy.infrastructure.ai.GroqAiProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class AiProviderConfig {

    @Value("${ai.provider:groq}")
    private String provider;

    @Bean
    @Primary
    public AiProvider aiProvider(ApplicationContext context) {
        if ("groq".equalsIgnoreCase(provider)) {
            return context.getBean(GroqAiProvider.class);
        }
        
        // Fallback or future providers (e.g. "openai")
        throw new IllegalArgumentException("Unsupported AI provider: " + provider);
    }
}
