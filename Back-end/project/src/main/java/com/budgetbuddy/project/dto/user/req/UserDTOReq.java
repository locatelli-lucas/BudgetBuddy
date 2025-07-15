package com.budgetbuddy.project.dto.user.req;

import com.budgetbuddy.project.domain.Role;
import com.budgetbuddy.project.entities.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;


public record UserDTOReq(
        @NotBlank
        @NotNull(message = "Name is required")
        String name,

        @Email(message = "Invalid email")
        @NotNull(message = "Email is required")
        String email,

        @NotBlank
        @NotNull(message = "Password is required")
        String password,

        double monthlyIncome,

        Role role
) {
    public User dtoToUser() {
        List<Role> roles = List.of(role);
        return new User(
                this.name(),
                this.email(),
                this.password(),
                this.monthlyIncome(),
                roles
        );
    }

    public User dtoToUser(Long id) {
        List<Role> roles = List.of(role);
        return new User(
                id,
                this.name(),
                this.email(),
                this.password(),
                this.monthlyIncome(),
                roles
        );
    }
}
