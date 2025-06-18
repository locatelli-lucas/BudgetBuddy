package com.budgetbuddy.project.config.security;

import com.budgetbuddy.project.entities.User;
import com.budgetbuddy.project.repositories.UserRepository;
import com.budgetbuddy.project.services.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenService tokenService;

    @Override
    protected void doFilterInternal(@NotNull HttpServletRequest request, @NotNull HttpServletResponse response, @NotNull FilterChain filterChain) throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() instanceof OAuth2AuthenticationToken oauthToken) {
            processOAuth2User(oauthToken.getPrincipal());
        }
        else if (SecurityContextHolder.getContext().getAuthentication() == null) {
            processJwtToken(request);
        }

        filterChain.doFilter(request, response);
    }

    private void processOAuth2User(OAuth2User oauthUser) {
        String email = oauthUser.getAttribute("email");
        Optional<User> userOptional = userRepository.findByEmail(email);

        User user = userOptional.orElseGet(() -> createUserFromOAuth2(oauthUser));

        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                user,
                null,
                user.getAuthorities()
        );

        SecurityContextHolder.getContext().setAuthentication(authToken);
    }

    private User createUserFromOAuth2(OAuth2User oauthUser) {
        User newUser = new User();
        newUser.setEmail(oauthUser.getAttribute("email"));
        newUser.setName(oauthUser.getAttribute("name"));
        return userRepository.save(newUser);
    }

    private void processJwtToken(HttpServletRequest request) {
        String token = getToken(request);
        if (token != null) {
            String email = tokenService.validateToken(token);
            userRepository.findByEmail(email)
                    .ifPresentOrElse(
                            user -> {
                                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                        user,
                                        null,
                                        user.getAuthorities()
                                );
                                SecurityContextHolder.getContext().setAuthentication(authToken);
                            },
                            () -> { throw new RuntimeException("User not found"); }
                    );
        }
    }

    private String getToken(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        return (token != null && token.startsWith("Bearer ")) ? token.substring(7) : null;
    }
}