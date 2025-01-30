package com.budgetbuddy.project.services;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.budgetbuddy.project.dto.login.res.LoginDTORes;
import com.budgetbuddy.project.entities.User;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class TokenService {

    private final String secret = "my_secret";

    public LoginDTORes generateToken(User user) {
        Algorithm algorithm = Algorithm.HMAC256(secret);
        Instant expirationDate = getExpirationDate();

        String token = JWT.create()
                .withIssuer("BudgetBuddy/security")
                .withSubject(user.getEmail())
                .withExpiresAt(expirationDate)
                .sign(algorithm);

        return new LoginDTORes("Bearer", token, expirationDate.toEpochMilli());
    }

    private Instant getExpirationDate() {
        return LocalDateTime
                .now()
                .plusHours(3)
                .toInstant(ZoneOffset.of("-03:00"));
    }

    public String validateToken(String token) {
        Algorithm algorithm = Algorithm.HMAC256(secret);

        return JWT.require(algorithm)
                .withIssuer("BudgetBuddy/security")
                .build()
                .verify(token)
                .getSubject();
    }
}
