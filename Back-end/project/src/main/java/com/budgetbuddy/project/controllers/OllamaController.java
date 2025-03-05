package com.budgetbuddy.project.controllers;

import com.budgetbuddy.project.services.OllamaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/consult")
public class OllamaController {

    @Autowired
    private OllamaService ollamaService;

    @PostMapping
    private ResponseEntity<String> generateAnswer(@RequestParam String prompt) {
        String response = this.ollamaService.generateAnswer(prompt);
        return ResponseEntity.ok(response);
    }
}
