package com.budgetbuddy.project.controllers;

import com.budgetbuddy.project.dto.direct_treasure.req.DirectTreasureDTOReq;
import com.budgetbuddy.project.dto.direct_treasure.res.DirectTreasureDTORes;
import com.budgetbuddy.project.entities.DirectTreasure;
import com.budgetbuddy.project.services.DirectTreasureService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/direct-treasure")
public class DirectTreasureController {

    @Autowired
    private DirectTreasureService directTreasureService;

    @PostMapping
    public ResponseEntity<DirectTreasureDTORes> create(@Valid DirectTreasureDTOReq body, UriComponentsBuilder uriBuilder) {
        DirectTreasureDTORes directTreasure = this.directTreasureService.create(body);
        URI uri = uriBuilder.path("direct-treasure/{id}").buildAndExpand(directTreasure.id()).toUri();
        return ResponseEntity.created(uri).body(directTreasure);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DirectTreasureDTORes> findById(@PathVariable Long id) {
        DirectTreasureDTORes directTreasure = this.directTreasureService.findById(id);
        return ResponseEntity.ok(directTreasure);
    }

    @GetMapping("/name")
    public ResponseEntity<DirectTreasureDTORes> findByName(@RequestParam String name) {
        DirectTreasureDTORes directTreasure = this.directTreasureService.findByName(name);
        return ResponseEntity.ok(directTreasure);
    }

}
