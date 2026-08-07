package com.budgetbuddy.infrastructure.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.when;

class GroqAiProviderTest {

    private GroqAiProvider groqAiProvider;

    @Mock
    private WebClient.Builder webClientBuilder;

    @Mock
    private WebClient webClient;

    @Mock
    private PromptLoader promptLoader;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(webClientBuilder.baseUrl(anyString())).thenReturn(webClientBuilder);
        when(webClientBuilder.build()).thenReturn(webClient);
        
        groqAiProvider = new GroqAiProvider(
                webClientBuilder,
                objectMapper,
                promptLoader,
                "https://api.groq.com/openai/v1",
                "test-key",
                "llama-3.3-70b-versatile"
        );
    }

    @Test
    void testProviderInitialization() {
        assertNotNull(groqAiProvider);
    }
}
