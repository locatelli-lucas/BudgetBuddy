package com.budgetbuddy.project.services;

import com.budgetbuddy.project.entities.User;
import com.budgetbuddy.project.exceptions.EntityNotFoundException;
import com.budgetbuddy.project.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public Page<User> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return this.userRepository.findAll(pageable);
    }

    public User findByIdEntity(Long id) {
        Optional<User> user = this.userRepository.findById(id);
        if(user.isEmpty()) throw new EntityNotFoundException("User with id " + id + " not found");
        return user.get();
    }

    public User findById(Long id) {
        return findByIdEntity(id);
    }

    public User findByEmail(String email) {
        Optional<User> user = this.userRepository.findByEmail(email);
        if(user.isEmpty()) throw new EntityNotFoundException("User with email " + email + " not found");
        return user.get();
    }

    public void deleteAll() {
        this.userRepository.deleteAll();
    }

    public void deleteById(Long id) {
        this.userRepository.deleteById(id);
    }
}
