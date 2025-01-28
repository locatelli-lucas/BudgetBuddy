package com.budgetbuddy.project.services;

import com.budgetbuddy.project.dto.user.req.UserDTOReq;
import com.budgetbuddy.project.dto.user.res.UserDTORes;
import com.budgetbuddy.project.entities.User;
import com.budgetbuddy.project.exceptions.BadRequestException;
import com.budgetbuddy.project.exceptions.EntityNotFoundException;
import com.budgetbuddy.project.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserDTORes createUser(UserDTOReq body) {
        if(body == null) throw new BadRequestException("Invalid user data provided");
        if(findByEmail(body.email()) != null) throw new BadRequestException("User with email " + body.email() + " already exists");



        User user = this.userRepository.save(body.dtoToUser());
        return UserDTORes.userToDto(user);
    }

    public Page<UserDTORes> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return this.userRepository.findAll(pageable).map(UserDTORes::userToDto);
    }

    public UserDTORes findByIdEntity(Long id) {
        Optional<User> user = this.userRepository.findById(id);
        if(user.isEmpty()) throw new EntityNotFoundException("User with id " + id + " not found");
        return UserDTORes.userToDto(user.get());
    }

    public UserDTORes findById(Long id) {
        return findByIdEntity(id);
    }

    public User findByEmail(String email) {
        Optional<User> user = this.userRepository.findByEmail(email);
        if(user.isEmpty()) throw new EntityNotFoundException("User with email " + email + " not found");
        return user.get();
    }

    public void deleteById(Long id) {
        this.userRepository.deleteById(id);
    }
}
