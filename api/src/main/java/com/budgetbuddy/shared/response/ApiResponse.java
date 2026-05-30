package com.budgetbuddy.shared.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    
    private int status;
    private String error;
    private String message;
    private String path;
    private T data;
    
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .status(200)
                .data(data)
                .build();
    }
}
