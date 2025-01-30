package com.budgetbuddy.project.exceptions;

public class EmailNotFoundException extends  RuntimeException {
    public EmailNotFoundException(String message) {
        super(message);
    }
}
