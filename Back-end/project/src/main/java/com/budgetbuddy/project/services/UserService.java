package com.budgetbuddy.project.services;

import com.budgetbuddy.project.dto.login.req.LoginDTOReq;
import com.budgetbuddy.project.dto.login.res.LoginDTORes;
import com.budgetbuddy.project.dto.user.req.UserDTOPatchReq;
import com.budgetbuddy.project.dto.user.req.UserDTOReq;
import com.budgetbuddy.project.dto.user.res.UserDTORes;
import com.budgetbuddy.project.entities.User;
import com.budgetbuddy.project.exceptions.BadRequestException;
import com.budgetbuddy.project.exceptions.EntityNotFoundException;
import com.budgetbuddy.project.repositories.UserRepository;
import lombok.extern.java.Log;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private TokenService tokenService;

    Logger logger = LogManager.getLogger(UserService.class);

    public UserDTORes createUser(UserDTOReq userDTOReq) {
        if(userDTOReq == null) throw new BadRequestException("Invalid user data provided");
        if(findByEmail(userDTOReq.email()) != null) throw new BadRequestException("User with email " + userDTOReq.email() + " already exists");

        String encodedPassword = passwordEncoder.encode(userDTOReq.password());

        User user = userDTOReq.dtoToUser();
        user.setPassword(encodedPassword);

        this.userRepository.save(user);
        return UserDTORes.userToDto(user);
    }

    public Page<UserDTORes> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return this.userRepository.findAll(pageable).map(UserDTORes::userToDto);
    }

    public User findByIdEntity(Long id) {
        if(id == null) throw new BadRequestException("No id provided");

        Optional<User> user = this.userRepository.findById(id);
        if(user.isEmpty()) throw new EntityNotFoundException("User with id " + id + " not found");
        return user.get();
    }

    public UserDTORes findById(Long id) {
        if(id == null) throw new BadRequestException("No id provided");
        if(findByIdEntity(id) == null) throw new EntityNotFoundException("User with id " + id + " not found");

        User user = findByIdEntity(id);
        return UserDTORes.userToDto(user);
    }

    public UserDTORes findByEmail(String email) {
        if(email == null) throw new BadRequestException("No email provided");

        Optional<User> user = this.userRepository.findByEmail(email);
        logger.info(user);
        System.out.println("user: " + user);

        return user.map(UserDTORes::userToDto).orElse(null);
    }

    public UserDTORes update(Long id, UserDTOPatchReq body) {
        if(id == null) throw new BadRequestException("No id provided");
        if(body == null) throw new BadRequestException("No user data provided");

        User user = findByIdEntity(id);

        String encodedPassword = passwordEncoder.encode(body.password());

        if(!Objects.equals(body.name(), user.getName())) user.setName(body.name());
        if(!Objects.equals(body.email(), user.getEmail())) user.setEmail(body.email());
        if(!Objects.equals(encodedPassword, user.getPassword())) user.setPassword(encodedPassword);
        if(!Objects.equals(body.monthlyIncome(), user.getMonthlyIncome())) user.setMonthlyIncome(body.monthlyIncome());

        this.userRepository.save(user);
        return UserDTORes.userToDto(user);
    }

    public UserDTORes put(Long id, UserDTOReq body) {
        if(id == null) throw new BadRequestException("No id provided");
        if(body == null) throw new BadRequestException("No user data provided");

        User user = this.userRepository.save(body.dtoToUser(id));
        return UserDTORes.userToDto(user);
    }

    public void deleteById(Long id) {
        if(id == null) throw new BadRequestException("No id provided");
        this.userRepository.deleteById(id);
    }

    public LoginDTORes login(LoginDTOReq loginDTOReq) {
        Optional<User> optionalUser = this.userRepository.findByEmail(loginDTOReq.email());

        if(optionalUser.isEmpty()) throw new EntityNotFoundException("User with email " + loginDTOReq.email() + " not found");
        User user = optionalUser.get();

        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(loginDTOReq.email(), loginDTOReq.password());

        authenticationManager.authenticate(token);

        return tokenService.generateToken(user);
    }
}
