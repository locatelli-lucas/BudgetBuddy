package com.budgetbuddy.config;

import com.budgetbuddy.infrastructure.ai.AiProvider;
import com.budgetbuddy.infrastructure.ai.GeminiAiProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class AiProviderConfig {

    @Bean
    @Primary
    public AiProvider aiProvider(GeminiAiProvider geminiAiProvider) {
        return geminiAiProvider;
    }
}
