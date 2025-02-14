package com.budgetbuddy.project.controllers;

import com.budgetbuddy.project.dto.account.req.AccountDTOReq;
import com.budgetbuddy.project.dto.account.res.AccountDTORes;
import com.budgetbuddy.project.services.AccountService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/accounts")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @PostMapping
    private ResponseEntity<AccountDTORes> create(@RequestBody @Valid AccountDTOReq body, UriComponentsBuilder uriBuilder) {
        AccountDTORes account = this.accountService.create(body);
        URI uri = uriBuilder.path("/accounts/{id}").buildAndExpand(account.id()).toUri();
        return ResponseEntity.created(uri).body(account);
    }

    @GetMapping
    private ResponseEntity<Page<AccountDTORes>> findAll(@RequestParam int page, @RequestParam int size) {
        Page<AccountDTORes> accounts = this.accountService.findAll(page, size);
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/{id}")
    private ResponseEntity<AccountDTORes> findById(@PathVariable Long id) {
        AccountDTORes account = this.accountService.findById(id);
        return ResponseEntity.ok(account);
    }

    @PatchMapping("/{id}")
    private ResponseEntity<AccountDTORes> update(@PathVariable Long id, @RequestBody @Valid AccountDTOReq body) {
        AccountDTORes account = this.accountService.update(id, body);
        return ResponseEntity.ok(account);
    }

    @PutMapping("/{id}")
    private ResponseEntity<AccountDTORes> put(@PathVariable Long id, @RequestBody @Valid AccountDTOReq body) {
        AccountDTORes account = this.accountService.replace(id, body);
        return ResponseEntity.ok(account);
    }

    @DeleteMapping("/{id}")
    private ResponseEntity<Void> delete(@PathVariable Long id) {
        this.accountService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
