package com.budgetbuddy.project.exceptions;

import com.budgetbuddy.project.dto.exception.req.ExceptionDTOReq;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalHandlingException {
    @ExceptionHandler
    public ResponseEntity<ExceptionDTOReq> HandleEntityNotFoundException(EntityNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ExceptionDTOReq(HttpStatus.NOT_FOUND, e.getMessage()));
    }

    @ExceptionHandler
    public ResponseEntity<ExceptionDTOReq> HandleBadRequestException(BadRequestException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ExceptionDTOReq(HttpStatus.BAD_REQUEST, e.getMessage()));
    }
}
