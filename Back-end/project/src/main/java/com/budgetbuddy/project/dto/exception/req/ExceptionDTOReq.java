package com.budgetbuddy.project.dto.exception.req;

import org.springframework.http.HttpStatus;

public record ExceptionDTOReq(HttpStatus status, String message) {
}
