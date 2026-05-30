package com.budgetbuddy.config;

import com.budgetbuddy.infrastructure.ai.AiProvider;
import com.budgetbuddy.infrastructure.ai.GroqAiProvider;
import com.budgetbuddy.infrastructure.ai.OpenAiProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class AiProviderConfig {

    @Value("${ai.provider}")
    private String activeProvider;

    @Bean
    @Primary
    public AiProvider aiProvider(OpenAiProvider openAiProvider, GroqAiProvider groqAiProvider) {
        if ("openai".equalsIgnoreCase(activeProvider)) {
            return openAiProvider;
        } else {
            return groqAiProvider; // default to groq
        }
    }
}
