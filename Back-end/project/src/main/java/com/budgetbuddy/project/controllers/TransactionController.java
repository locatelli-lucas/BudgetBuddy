package com.budgetbuddy.project.controllers;

import com.budgetbuddy.project.dto.transaction.req.TransactionDTOPatchReq;
import com.budgetbuddy.project.dto.transaction.req.TransactionDTOReq;
import com.budgetbuddy.project.dto.transaction.res.TransactionDTORes;
import com.budgetbuddy.project.services.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping
    private ResponseEntity<TransactionDTORes> create(@RequestBody @Valid TransactionDTOReq body, UriComponentsBuilder uriBuilder) {
        TransactionDTORes transaction = this.transactionService.create(body);
        URI uri = uriBuilder.path("/transactions/{id}").buildAndExpand(transaction.id()).toUri();
        return ResponseEntity.created(uri).body(transaction);
    }

    @GetMapping
    private ResponseEntity<Page<TransactionDTORes>> findAll(@RequestParam int page, @RequestParam int size) {
        Page<TransactionDTORes> transactions = this.transactionService.findAll(page, size);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{id}")
    private ResponseEntity<TransactionDTORes> findById(@PathVariable Long id) {
        TransactionDTORes transaction = this.transactionService.findById(id);
        return ResponseEntity.ok(transaction);
    }

    @PatchMapping("/{id}")
    private ResponseEntity<TransactionDTORes> update(@PathVariable Long id, @RequestBody @Valid TransactionDTOPatchReq body) {
        TransactionDTORes transaction = this.transactionService.update(id, body);
        return ResponseEntity.ok(transaction);
    }

    @PutMapping("/{id}")
    private ResponseEntity<TransactionDTORes> put(@PathVariable Long id, @RequestBody @Valid TransactionDTOReq body) {
        TransactionDTORes transaction = this.transactionService.put(id, body);
        return ResponseEntity.ok(transaction);
    }

    @DeleteMapping("/{id}")
    private ResponseEntity<Void> delete(@PathVariable Long id) {
        this.transactionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
