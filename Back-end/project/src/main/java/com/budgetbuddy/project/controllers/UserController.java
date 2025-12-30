package com.budgetbuddy.project.controllers;

import com.budgetbuddy.project.dto.login.req.LoginDTOReq;
import com.budgetbuddy.project.dto.login.res.LoginDTORes;
import com.budgetbuddy.project.dto.user.req.UserDTOPatchReq;
import com.budgetbuddy.project.dto.user.req.UserDTOReq;
import com.budgetbuddy.project.dto.user.res.UserDTORes;
import com.budgetbuddy.project.services.UserService;
import jakarta.validation.Valid;
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
    private ResponseEntity<UserDTORes> createUser(@Valid @RequestBody UserDTOReq body, UriComponentsBuilder uriBuilder) {
        UserDTORes user = this.userService.createUser(body);
        URI uri = uriBuilder.path("users/{id}").buildAndExpand(user.id()).toUri();
        return ResponseEntity.created(uri).body(user);
    }

    @GetMapping
    private ResponseEntity<Page<UserDTORes>> findAll(@RequestParam int page, @RequestParam int size) {
        Page<UserDTORes> list = this.userService.findAll(page, size);
        return ResponseEntity.ok(list);
    }

    @GetMapping("id/{id}")
    private ResponseEntity<UserDTORes> findById(@PathVariable Long id) {
        UserDTORes user = this.userService.findById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping("email/{email}")
    private ResponseEntity<UserDTORes> findByEmail(@PathVariable String email) {
        UserDTORes user = this.userService.findByEmail(email);
        return ResponseEntity.ok(user);
    }

    @PatchMapping("/{id}")
    private ResponseEntity<UserDTORes> update(@PathVariable Long id, @Valid @RequestBody UserDTOPatchReq body) {
        UserDTORes user = this.userService.update(id, body);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    private ResponseEntity<UserDTORes> put(@PathVariable Long id, @Valid @RequestBody UserDTOReq body) {
        UserDTORes user = this.userService.put(id, body);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    private ResponseEntity<UserDTORes> deleteById(@PathVariable Long id) {
        this.userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    private ResponseEntity<LoginDTORes> login(@RequestBody LoginDTOReq body) {
        LoginDTORes login = this.userService.login(body);
        return ResponseEntity.ok(login);
    }
}

