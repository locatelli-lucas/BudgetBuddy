package com.budgetbuddy.project.controllers;

import com.budgetbuddy.project.entities.User;
import com.budgetbuddy.project.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping(("/users"))
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping
    private ResponseEntity<User> createUser(@RequestBody User body, UriComponentsBuilder uriBuilder) {
        User user = userService.createUser(body);
        URI uri = uriBuilder.path("users/{id}").buildAndExpand(user.getId()).toUri();
        return ResponseEntity.created(uri).body(user);
    }

    @GetMapping
    private ResponseEntity<Page<User>> findAll(int page, int size) {
        Page<User> list = this.userService.findAll(page, size);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    private ResponseEntity<User> findById(@PathVariable Long id) {
        User user = this.userService.findById(id);
        return ResponseEntity.ok(user);
    }
}

