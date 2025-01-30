package com.budgetbuddy.project.controllers;

import com.budgetbuddy.project.dto.stock.req.StockDTOReq;
import com.budgetbuddy.project.dto.stock.res.StockDTORes;
import com.budgetbuddy.project.services.StockService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/stocks")
public class StockController {

    @Autowired
    private StockService stockService;

    @PostMapping
    public ResponseEntity<StockDTORes> create(@Valid @RequestBody StockDTOReq body, UriComponentsBuilder uriBuilder) {
        StockDTORes stock = this.stockService.create(body);
        URI uri = uriBuilder.path("stocks/{id}").buildAndExpand(stock.id()).toUri();
        return ResponseEntity.created(uri).body(stock);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StockDTORes> findById(@PathVariable Long id) {
        StockDTORes stock = this.stockService.findById(id);
        return ResponseEntity.ok(stock);
    }
}
