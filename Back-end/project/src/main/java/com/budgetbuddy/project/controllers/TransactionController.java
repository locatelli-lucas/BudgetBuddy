package com.budgetbuddy.project.controllers;

import com.budgetbuddy.project.dto.transaction.req.TransactionDTOReq;
import com.budgetbuddy.project.dto.transaction.res.TransactionDTORes;
import com.budgetbuddy.project.services.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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
}
