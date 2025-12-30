package com.budgetbuddy.project.dto.login.req;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LoginDTOReq(

        @Email
        @NotNull(message = "Email cannot be null")
        @NotBlank(message = "Email cannot be blank")
        String email,

        @NotNull(message = "password cannot be null")
        @NotBlank(message = "password cannot be blank")
        String password) {
}
