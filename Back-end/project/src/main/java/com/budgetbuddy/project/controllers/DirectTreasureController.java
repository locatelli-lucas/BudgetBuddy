package com.budgetbuddy.project.controllers;

import com.budgetbuddy.project.dto.direct_treasure.req.DirectTreasureDTOReq;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("direct-treasure")
public class DirectTreasureController {

    @Autowired
    private DirectTreasureService directTreasureService;

    @PostMapping
    public ResponseEntity<DirectTreasureDTORes> create(@Valid DirectTreasureDTOReq body, UriComponentsBuilder uriBuilder) {

    }

}
