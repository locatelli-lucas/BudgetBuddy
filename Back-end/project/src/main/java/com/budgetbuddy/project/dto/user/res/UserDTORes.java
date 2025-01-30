package com.budgetbuddy.project.dto.user.res;

import com.budgetbuddy.project.entities.User;

public record UserDTORes(
       Long id,
       String name,
       String email,
       String password,
       String profilePicture
) {
    public static UserDTORes userToDto(User user) {
        return new UserDTORes(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPassword(),
                user.getProfilePicture()
        );
    }
}
