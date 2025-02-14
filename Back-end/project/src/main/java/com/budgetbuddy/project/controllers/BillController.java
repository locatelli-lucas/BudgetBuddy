package com.budgetbuddy.project.controllers;

import com.budgetbuddy.project.dto.bill.req.BillDTOPatchReq;
import com.budgetbuddy.project.dto.bill.req.BillDTOReq;
import com.budgetbuddy.project.dto.bill.res.BillDTORes;
import com.budgetbuddy.project.services.BillService;
import jakarta.validation.Valid;
import jakarta.websocket.server.PathParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/bills")
public class BillController {

    @Autowired
    private BillService billService;

    @PostMapping
    private ResponseEntity<BillDTORes> create(@RequestBody @Valid BillDTOReq body, UriComponentsBuilder uriBuilder) {
        BillDTORes bill = this.billService.create(body);
        URI uri = uriBuilder.path("/bills/{id}").buildAndExpand(bill.id()).toUri();
        return ResponseEntity.created(uri).body(bill);
    }

    @GetMapping
    private ResponseEntity<Page<BillDTORes>> findAll(@RequestParam int page, @RequestParam int size) {
        Page<BillDTORes> bills = this.billService.findAll(page, size);
        return ResponseEntity.ok(bills);
    }

    @GetMapping("/{id}")
    private ResponseEntity<BillDTORes> findById(@PathVariable Long id) {
        BillDTORes bills = this.billService.findById(id);
        return ResponseEntity.ok(bills);
    }

    @PatchMapping("/{id}")
    private ResponseEntity<BillDTORes> update(@PathVariable Long id, @RequestBody @Valid BillDTOPatchReq body) {
        BillDTORes bill = this.billService.update(id, body);
        return ResponseEntity.ok(bill);
    }

    @PutMapping("/{id}")
    private ResponseEntity<BillDTORes> put(@PathVariable Long id, @RequestBody @Valid BillDTOReq body) {
        BillDTORes bill = this.billService.put(id, body);
        return ResponseEntity.ok(bill);
    }

    @DeleteMapping("/{id}")
    private ResponseEntity<Void> delete(@PathVariable Long id) {
        this.billService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
