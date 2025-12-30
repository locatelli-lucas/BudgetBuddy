package com.budgetbuddy.project.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping("/open")
    public String open() {
        System.out.println("Endpoint '/test/open' was called");
        return "open";
    }
}
