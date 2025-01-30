package com.budgetbuddy.project.controllers;

import com.budgetbuddy.project.dto.portfolio.req.PortfolioDTOReq;
import com.budgetbuddy.project.dto.portfolio.res.PortfolioDTORes;
import com.budgetbuddy.project.services.PortfolioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/portfolio")
public class PortfolioController {

    @Autowired
    private PortfolioService portfolioService;

    @PostMapping
    public ResponseEntity<PortfolioDTORes> create(@Valid @RequestBody PortfolioDTOReq body, UriComponentsBuilder uriBuilder) {
        PortfolioDTORes portfolio = this.portfolioService.createPortfolio(body);
        URI uri = uriBuilder.path("portfolio/{id}").buildAndExpand(portfolio.id()).toUri();
        return ResponseEntity.created(uri).body(portfolio);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PortfolioDTORes> findById(@PathVariable Long id) {
        PortfolioDTORes portfolio = this.portfolioService.findById(id);
        return ResponseEntity.ok(portfolio);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<PortfolioDTORes> deleteById(@PathVariable Long id) {
        this.portfolioService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<PortfolioDTORes> patch(@PathVariable Long id, @Valid @RequestBody PortfolioDTOReq body) {
        PortfolioDTORes portfolio = this.portfolioService.patch(id, body);
        return ResponseEntity.ok(portfolio);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PortfolioDTORes> put(@PathVariable Long id, @Valid @RequestBody PortfolioDTOReq body) {
        PortfolioDTORes portfolio = this.portfolioService.put(id, body);
        return ResponseEntity.ok(portfolio);
    }
}
