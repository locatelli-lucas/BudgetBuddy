package com.budgetbuddy.project.dto.user.req;

import com.budgetbuddy.project.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserDTOPatchReq(
        @NotNull
        Long id,

        @NotNull
        @NotBlank(message = "Name is required")
        String name,

        @NotNull
        @Email(message = "Invalid email")
        @NotBlank(message = "Email is required")
        String email,

        @NotNull
        @NotBlank(message = "Password is required")
        String password,

        @NotNull
        @NotBlank
        String profilePicture,

        @NotNull
        double monthlyIncome

) {

}

